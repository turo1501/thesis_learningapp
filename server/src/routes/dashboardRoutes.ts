import express from "express";
import { 
  getDashboardStats, 
  getPendingActions, 
  getMonthlyRevenue, 
  getRecentUserActivities
} from "../controllers/dashboardController";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// All dashboard routes should be restricted to admin users
router.get("/stats", requireRole(["admin"]), getDashboardStats);
router.get("/pending-actions", requireRole(["admin"]), getPendingActions);
router.get("/monthly-revenue", requireRole(["admin"]), getMonthlyRevenue);
router.get("/user-activities", requireRole(["admin"]), getRecentUserActivities);

export default router; 