import express from "express";
import {
  addComment,
  getChapterComments,
  deleteComment,
} from "../controllers/commentController";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Get comments for a chapter
router.get(
  "/:courseId/sections/:sectionId/chapters/:chapterId/comments",
  getChapterComments
);

// Add a comment to a chapter
router.post(
  "/:courseId/sections/:sectionId/chapters/:chapterId/comments",
  requireAuth(),
  addComment
);

// Delete a comment
router.delete(
  "/:courseId/sections/:sectionId/chapters/:chapterId/comments/:commentId",
  requireAuth(),
  deleteComment
);

export default router; 