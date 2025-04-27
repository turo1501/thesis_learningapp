import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { ApiError } from "../utils/errors";

// Schemas
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  courseId: z.string().min(1, "Course ID is required"),
  deadline: z.string().nullable(),
  points: z.number().min(0, "Points must be at least 0"),
  status: z.enum(["active", "closed", "draft"]),
  attachments: z.array(z.string()).optional(),
});

const updateAssignmentSchema = createAssignmentSchema.partial();

// Create a new assignment
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const validatedData = createAssignmentSchema.parse(req.body);
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
    });
    
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    
    // Calculate total students in the course
    const enrollments = await prisma.enrollment.count({
      where: { courseId: validatedData.courseId },
    });
    
    const assignment = await prisma.assignment.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        courseId: validatedData.courseId,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        points: validatedData.points,
        status: validatedData.status,
        totalStudents: enrollments,
        submissionCount: 0,
        dateCreated: new Date(),
        attachments: validatedData.attachments || [],
      },
    });
    
    return res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all assignments for a teacher
export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Find all courses taught by this teacher
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: userId },
      select: { id: true },
    });
    
    const courseIds = teacherCourses.map((course: { id: string }) => course.id);
    
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        dateCreated: 'desc',
      },
    });
    
    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all assignments for a specific course
export const getCourseAssignments = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
      },
      orderBy: {
        dateCreated: 'desc',
      },
    });
    
    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get a single assignment by ID
export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            submissionDate: true,
            status: true,
            grade: true,
          },
        },
      },
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update an assignment
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateAssignmentSchema.parse(req.body);
    
    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
    });
    
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }
    
    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...validatedData,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : existingAssignment.deadline,
        updatedAt: new Date(),
      },
    });
    
    return res.status(200).json({
      success: true,
      data: updatedAssignment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Delete an assignment
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
    });
    
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }
    
    // Delete assignment
    await prisma.assignment.delete({
      where: { id },
    });
    
    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}; 