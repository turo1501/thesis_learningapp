import express from "express";
import { 
  requestRoleChange, 
  approveRoleChange, 
  rejectRoleChange,
  getPendingRoleChangeRequests
} from "../controllers/roleChangeController";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// Submit a role change request
router.post("/request", requestRoleChange);

// Admin routes for managing role change requests
router.get("/pending", requireRole(["admin"]), getPendingRoleChangeRequests);
router.put("/:userId/approve", requireRole(["admin"]), approveRoleChange);
router.put("/:userId/reject", requireRole(["admin"]), rejectRoleChange);

export default router;
