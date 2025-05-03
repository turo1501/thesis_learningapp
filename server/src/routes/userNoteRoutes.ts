import express from "express";
import {
  getUserCourseNotes,
  getChapterNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/userNoteController";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Get all notes for a course
router.get("/:courseId", requireAuth(), getUserCourseNotes);

// Get notes for a specific chapter
router.get(
  "/:courseId/sections/:sectionId/chapters/:chapterId",
  requireAuth(),
  getChapterNotes
);

// Create a note
router.post("/", requireAuth(), createNote);

// Update a note
router.put("/:noteId", requireAuth(), updateNote);

// Delete a note
router.delete("/:noteId", requireAuth(), deleteNote);

export default router; 