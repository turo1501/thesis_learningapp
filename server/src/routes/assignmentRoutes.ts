import express from "express";
import { requireAuth } from "@clerk/express";
import { 
  createAssignment, 
  deleteAssignment, 
  getAssignment, 
  getCourseAssignments, 
  gradeSubmission, 
  submitAssignment, 
  updateAssignment,
  getUploadAssignmentFileUrl
} from "../controllers/assignmentController";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// Get all assignments for a course
router.get("/course/:courseId", getCourseAssignments);

// Get a single assignment
router.get("/:assignmentId", getAssignment);

// Create a new assignment (teacher only)
router.post(
  "/", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  createAssignment
);

// Update an assignment (teacher only)
router.put(
  "/:assignmentId", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  updateAssignment
);

// Delete an assignment (teacher only)
router.delete(
  "/:assignmentId", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  deleteAssignment
);

// Generate upload URL for assignment files
router.post(
  "/get-upload-file-url",
  requireAuth(),
  authenticate,
  requireRole(["teacher", "admin"]),
  getUploadAssignmentFileUrl
);

// Submit an assignment (student only)
router.post(
  "/:assignmentId/submit", 
  requireAuth(), 
  authenticate, 
  requireRole(["student"]), 
  submitAssignment
);

// Grade a submission (teacher only)
router.put(
  "/:assignmentId/submissions/:studentId/grade", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  gradeSubmission
);

export default router; 

