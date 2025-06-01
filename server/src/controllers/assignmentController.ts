import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Assignment from "../models/assignmentModel";
import { getAuth } from "@clerk/express";
import AWS from "aws-sdk";

// Initialize S3 client
const s3 = new AWS.S3();

// Type for extending Request to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    imageUrl?: string;
    role?: "student" | "teacher" | "admin";
  };
}

/**
 * Get all assignments for a course
 */
export const getCourseAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }
    
    const assignments = await Assignment.scan("courseId").eq(courseId).exec();
    
    res.status(200).json(assignments);
  } catch (error: any) {
    console.error("Error getting course assignments:", error);
    res.status(500).json({ 
      message: "Failed to get course assignments", 
      error: error.message 
    });
  }
};

/**
 * Get a single assignment by ID
 */
export const getAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    
    if (!assignmentId) {
      res.status(400).json({ message: "Assignment ID is required" });
      return;
    }
    
    const assignment = await Assignment.get(assignmentId);
    
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    
    res.status(200).json(assignment);
  } catch (error: any) {
    console.error("Error getting assignment:", error);
    res.status(500).json({ 
      message: "Failed to get assignment", 
      error: error.message 
    });
  }
};

/**
 * Create a new assignment
 */
export const createAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { 
      courseId, 
      title, 
      description, 
      dueDate, 
      points,
      status,
      attachments 
    } = req.body;
    
    if (!courseId || !title || !description || !dueDate || !points) {
      res.status(400).json({ 
        message: "Course ID, title, description, due date, and points are required" 
      });
      return;
    }
    
    // Ensure only teachers can create assignments
    if (req.user?.role !== "teacher" && req.user?.role !== "admin") {
      res.status(403).json({ message: "Only teachers can create assignments" });
      return;
    }
    
    const assignment = new Assignment({
      assignmentId: uuidv4(),
      courseId,
      teacherId: userId,
      title,
      description,
      dueDate,
      points,
      status: status || "draft",
      attachments: attachments || [],
      submissions: []
    });
    
    await assignment.save();
    
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ 
      message: "Failed to create assignment", 
      error: error.message 
    });
  }
};

/**
 * Update an assignment
 */
export const updateAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { userId } = getAuth(req);
    const updateData = req.body;
    
    // Get the existing assignment
    const assignment = await Assignment.get(assignmentId);
    
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    
    // Check if the user is the teacher who created the assignment
    if (assignment.teacherId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ 
        message: "You don't have permission to update this assignment" 
      });
      return;
    }
    
    // Apply updates
    Object.assign(assignment, updateData);
    
    // Save updated assignment
    await assignment.save();
    
    res.status(200).json(assignment);
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ 
      message: "Failed to update assignment", 
      error: error.message 
    });
  }
};

/**
 * Delete an assignment
 */
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { userId } = getAuth(req);
    
    // Get the assignment to check ownership
    const assignment = await Assignment.get(assignmentId);
    
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    
    // Check if the user is the teacher who created the assignment
    if (assignment.teacherId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ 
        message: "You don't have permission to delete this assignment" 
      });
      return;
    }
    
    // Delete the assignment
    await Assignment.delete(assignmentId);
    
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ 
      message: "Failed to delete assignment", 
      error: error.message 
    });
  }
};

/**
 * Submit assignment (for students)
 */
export const submitAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { userId } = getAuth(req);
    const { content, attachments } = req.body;
    
    if (!content && (!attachments || attachments.length === 0)) {
      res.status(400).json({ message: "Submission content or attachments are required" });
      return;
    }
    
    // Get the assignment
    const assignment = await Assignment.get(assignmentId);
    
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    
    // Check if user has already submitted
    const existingSubmission = assignment.submissions.find(
      (submission: any) => submission.studentId === userId
    );
    
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content || '';
      existingSubmission.attachments = attachments || [];
      existingSubmission.submissionDate = new Date().toISOString();
      existingSubmission.status = "submitted";
    } else {
      // Add new submission
      assignment.submissions.push({
        studentId: userId,
        studentName: req.user?.name || "Unknown Student",
        content: content || '',
        attachments: attachments || [],
        submissionDate: new Date().toISOString(),
        status: "submitted"
      });
    }
    
    // Save the updated assignment with the new submission
    await assignment.save();
    
    res.status(200).json({ message: "Assignment submitted successfully" });
  } catch (error: any) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ 
      message: "Failed to submit assignment", 
      error: error.message 
    });
  }
};

/**
 * Grade a submission (for teachers)
 */
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId, studentId } = req.params;
    const { userId } = getAuth(req);
    const { grade, feedback } = req.body;
    
    if (grade === undefined || !feedback) {
      res.status(400).json({ message: "Grade and feedback are required" });
      return;
    }
    
    // Get the assignment
    const assignment = await Assignment.get(assignmentId);
    
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }
    
    // Check if the user is the teacher who created the assignment
    if (assignment.teacherId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ 
        message: "You don't have permission to grade this assignment" 
      });
      return;
    }
    
    // Find the student's submission
    const submissionIndex = assignment.submissions.findIndex(
      (submission: any) => submission.studentId === studentId
    );
    
    if (submissionIndex === -1) {
      res.status(404).json({ message: "Student submission not found" });
      return;
    }
    
    // Update the submission with grade and feedback
    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback;
    assignment.submissions[submissionIndex].status = "graded";
    
    // Save the updated assignment
    await assignment.save();
    
    res.status(200).json({ message: "Submission graded successfully" });
  } catch (error: any) {
    console.error("Error grading submission:", error);
    res.status(500).json({ 
      message: "Failed to grade submission", 
      error: error.message 
    });
  }
};

/**
 * Generate upload URL for assignment files
 */
export const getUploadAssignmentFileUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName, fileType } = req.body;

  // Validate required parameters
  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    // Get bucket name from environment variable
    const bucketName = process.env.S3_BUCKET_NAME;
    
    // Make sure the bucket name is valid
    if (!bucketName || bucketName.trim() === '') {
      console.error("S3_BUCKET_NAME environment variable is missing or empty");
      res.status(500).json({ 
        message: "Server configuration error - S3 bucket not configured" 
      });
      return;
    }
    
    // Create a unique file path
    const uniqueId = uuidv4();
    const s3Key = `assignments/${uniqueId}/${fileName}`;

    console.log(`Generating S3 upload URL: Bucket=${bucketName}, Key=${s3Key}`);

    // Generate the pre-signed URL
    const s3Params = {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 60,
      ContentType: fileType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
    
    // Determine the file URL based on environment config
    let fileUrl;
    if (process.env.CLOUDFRONT_DOMAIN) {
      fileUrl = `${process.env.CLOUDFRONT_DOMAIN}/assignments/${uniqueId}/${fileName}`;
    } else {
      fileUrl = `https://${bucketName}.s3.amazonaws.com/assignments/${uniqueId}/${fileName}`;
    }
    
    console.log(`Generated upload URL successfully for: ${fileName}`);

    // Return the upload URL and file URL to the client
    res.status(200).json({
      uploadUrl,
      fileUrl,
      fileName
    });
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ 
      message: "Error generating upload URL", 
      error: error.message || String(error) 
    });
  }
};

/**
 * Generate upload URL for student assignment submission files
 */
export const getStudentUploadFileUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName, fileType } = req.body;
  const { userId } = getAuth(req);

  // Validate required parameters
  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    // Get bucket name from environment variable
    const bucketName = process.env.S3_BUCKET_NAME;
    
    // Make sure the bucket name is valid
    if (!bucketName || bucketName.trim() === '') {
      console.error("S3_BUCKET_NAME environment variable is missing or empty");
      res.status(500).json({ 
        message: "Server configuration error - S3 bucket not configured" 
      });
      return;
    }
    
    // Create a unique file path for student submissions
    const uniqueId = uuidv4();
    const s3Key = `student-submissions/${userId}/${uniqueId}/${fileName}`;

    console.log(`Generating S3 upload URL for student: Bucket=${bucketName}, Key=${s3Key}`);

    // Generate the pre-signed URL
    const s3Params = {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 60,
      ContentType: fileType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
    
    // Determine the file URL based on environment config
    let fileUrl;
    if (process.env.CLOUDFRONT_DOMAIN) {
      fileUrl = `${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
    } else {
      fileUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`;
    }
    
    console.log(`Generated upload URL successfully for student submission: ${fileName}`);

    // Return the upload URL and file URL to the client
    res.status(200).json({
      uploadUrl,
      fileUrl,
      fileName
    });
  } catch (error: any) {
    console.error("Error generating student upload URL:", error);
    res.status(500).json({ 
      message: "Error generating upload URL", 
      error: error.message || String(error) 
    });
  }
};
