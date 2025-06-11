import express from "express";
import { requireAuth } from "@clerk/express";
import {
  createQuiz,
  getQuiz,
  getQuizzesByChapter,
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getUserQuizSubmissions
} from "../controllers/quizController";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth());

// Quiz management routes (for teachers)
router.post("/", createQuiz);
router.get("/:quizId", getQuiz);
router.get("/course/:courseId/chapter/:chapterId", getQuizzesByChapter);

// Quiz taking routes (for students)
router.post("/:quizId/start", startQuizAttempt);
router.put("/submissions/:submissionId/answer", submitQuizAnswer);
router.post("/submissions/:submissionId/complete", completeQuizAttempt);
router.get("/:quizId/submissions", getUserQuizSubmissions);

export default router; 