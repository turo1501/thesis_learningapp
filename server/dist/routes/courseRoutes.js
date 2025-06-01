"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const courseController_1 = require("../controllers/courseController");
const express_2 = require("@clerk/express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/", courseController_1.listCourses);
router.post("/", (0, express_2.requireAuth)(), courseController_1.createCourse);
router.post("/ai-generate", (0, express_2.requireAuth)(), courseController_1.generateAICourse);
router.get("/ai-status", (0, express_2.requireAuth)(), courseController_1.checkDeepseekStatus);
router.get("/:courseId", courseController_1.getCourse);
router.put("/:courseId", (0, express_2.requireAuth)(), upload.single("image"), courseController_1.updateCourse);
router.delete("/:courseId", (0, express_2.requireAuth)(), courseController_1.deleteCourse);
router.post("/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url", (0, express_2.requireAuth)(), courseController_1.getUploadVideoUrl);
// Mock endpoints cho môi trường local không có AWS S3
if (process.env.NODE_ENV !== "production") {
    console.log("Setting up mock video endpoints for local development");
    // Tạo thư mục mock nếu chưa tồn tại
    const mockDir = path_1.default.join(__dirname, "../../mock-uploads");
    if (!fs_1.default.existsSync(mockDir)) {
        try {
            fs_1.default.mkdirSync(mockDir, { recursive: true });
            console.log("Created mock uploads directory:", mockDir);
        }
        catch (err) {
            console.error("Failed to create mock uploads directory:", err);
        }
    }
    // Mock endpoint để xử lý upload
    router.put("/mock-upload/*", (req, res) => {
        const mockPath = req.path.replace("/mock-upload/", "");
        console.log("Mock upload received for:", mockPath);
        // Create a consistent response format
        res.status(200).json({
            success: true,
            message: "Mock file uploaded successfully",
            path: mockPath
        });
    });
    // Mock endpoint để phục vụ video
    router.get("/mock-video/*", (req, res) => {
        const mockPath = req.path.replace("/mock-video/", "");
        console.log("Mock video request for:", mockPath);
        // Return a placeholder response with consistent format
        res.status(200).json({
            success: true,
            url: `/mock-video/${mockPath}`,
            contentType: "video/mp4",
            message: "This is a mock video URL for local development"
        });
    });
}
exports.default = router;
