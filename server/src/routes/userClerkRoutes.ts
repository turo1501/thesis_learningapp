import express from "express";
import { 
  updateUser, 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus,
  createUser,
  resetPassword
} from "../controllers/userClerkController";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// Debug route to check authentication
router.get("/check-auth", (req, res) => {
  // Return the user object from request to check what's available
  res.json({
    message: "Authentication check",
    user: (req as any).user,
    auth: (req as any).auth,
  });
});

// User routes
router.get("/", requireRole(["admin"]), getAllUsers);
router.get("/:userId", requireRole(["admin"]), getUserById);
router.put("/:userId", requireRole(["admin"]), updateUser);
router.put("/:userId/role", requireRole(["admin"]), updateUserRole);
router.put("/:userId/status", requireRole(["admin"]), updateUserStatus);
router.post("/", requireRole(["admin"]), createUser);

// Tạo export riêng cho resetPassword để sử dụng trong index.ts
export { resetPassword };

export default router;