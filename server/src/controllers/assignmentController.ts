import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Assignment from "../models/assignmentModel";
import { getAuth } from "@clerk/express";

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
      status: "draft",
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
    const { content } = req.body;
    
    if (!content) {
      res.status(400).json({ message: "Submission content is required" });
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
      existingSubmission.content = content;
      existingSubmission.submissionDate = new Date().toISOString();
      existingSubmission.status = "submitted";
    } else {
      // Add new submission
      assignment.submissions.push({
        studentId: userId,
        studentName: req.user?.name || "Unknown Student",
        content,
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
