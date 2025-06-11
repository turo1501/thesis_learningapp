import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getCourseReviews,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
  markReviewHelpful,
  getCourseRatingStats
} from "../controllers/courseReviewController";

const router = express.Router();

// Public routes (no authentication required)
router.get("/courses/:courseId/reviews", getCourseReviews);
router.get("/courses/:courseId/rating-stats", getCourseRatingStats);

// Protected routes (authentication required)
router.post("/courses/:courseId/reviews", requireAuth(), createCourseReview);
router.put("/reviews/:reviewId", requireAuth(), updateCourseReview);
router.delete("/reviews/:reviewId", requireAuth(), deleteCourseReview);
router.post("/reviews/:reviewId/helpful", requireAuth(), markReviewHelpful);

export default router; 