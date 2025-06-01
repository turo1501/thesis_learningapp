import express from "express";
import { 
  getDashboardStats, 
  getPendingActions, 
  getMonthlyRevenue, 
  getRecentUserActivities
} from "../controllers/dashboardController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics (users, courses, posts, revenue)
 * @access  Admin
 */
router.get("/stats", requireAuth, requireAdmin, getDashboardStats);

/**
 * @route   GET /api/dashboard/pending-actions
 * @desc    Get pending actions (blog approvals, registrations, etc.)
 * @access  Admin
 */
router.get("/pending-actions", requireAuth, requireAdmin, getPendingActions);

/**
 * @route   GET /api/dashboard/monthly-revenue
 * @desc    Get monthly user growth data (students and teachers) - was previously monthly revenue
 * @access  Admin
 */
router.get("/monthly-revenue", requireAuth, requireAdmin, getMonthlyRevenue);

/**
 * @route   GET /api/dashboard/user-activities
 * @desc    Get recent user activities (enrollments, posts, payments)
 * @access  Admin
 */
router.get("/user-activities", requireAuth, requireAdmin, getRecentUserActivities);

export default router; 