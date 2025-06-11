import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserCourseProgress,
  getUserEnrolledCourses,
  updateUserCourseProgress,
} from "../controllers/userCourseProgressController";

const router = express.Router();

router.get("/:userId/enrolled-courses", getUserEnrolledCourses);
router.get("/:userId/courses/:courseId", requireAuth(), getUserCourseProgress);
router.put("/:userId/courses/:courseId", requireAuth(), updateUserCourseProgress);

export default router;