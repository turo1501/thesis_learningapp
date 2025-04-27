import express from "express";
import { requireAuth } from "@clerk/express";
import { 
  addMeetingNotes, 
  createMeeting, 
  deleteMeeting, 
  getCourseMeetings, 
  getMeeting, 
  getStudentMeetings, 
  getTeacherMeetings, 
  respondToMeeting, 
  updateMeeting 
} from "../controllers/meetingController";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// Get meeting by ID
router.get("/:meetingId", requireAuth(), getMeeting);

// Get all meetings for a teacher
router.get(
  "/teacher/:teacherId", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  getTeacherMeetings
);

// Get all meetings for a student
router.get(
  "/student/:studentId", 
  requireAuth(), 
  authenticate, 
  requireRole(["student"]), 
  getStudentMeetings
);

// Get all meetings for a course
router.get("/course/:courseId", requireAuth(), getCourseMeetings);

// Create a new meeting (teacher only)
router.post(
  "/", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  createMeeting
);

// Update a meeting (teacher only)
router.put(
  "/:meetingId", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  updateMeeting
);

// Delete a meeting (teacher only)
router.delete(
  "/:meetingId", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  deleteMeeting
);

// Respond to a meeting invitation (student only)
router.post(
  "/:meetingId/respond", 
  requireAuth(), 
  authenticate, 
  requireRole(["student"]), 
  respondToMeeting
);

// Add notes to a meeting (teacher only)
router.post(
  "/:meetingId/notes", 
  requireAuth(), 
  authenticate, 
  requireRole(["teacher", "admin"]), 
  addMeetingNotes
);

export default router; 