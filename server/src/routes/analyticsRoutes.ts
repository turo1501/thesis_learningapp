import express from "express";
import { 
  getAnalyticsSummary,
  getUserAnalytics,
  getCourseAnalytics,
  getRevenueAnalytics,
  getPlatformAnalytics
} from "../controllers/analyticsController";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// All analytics routes should be restricted to admin users
router.get("/summary", requireRole(["admin"]), getAnalyticsSummary);
router.get("/users", requireRole(["admin"]), getUserAnalytics);
router.get("/courses", requireRole(["admin"]), getCourseAnalytics);
router.get("/revenue", requireRole(["admin"]), getRevenueAnalytics);
router.get("/platform", requireRole(["admin"]), getPlatformAnalytics);

export default router; 
 
 