import express from "express";
import multer from "multer";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
  getUploadVideoUrl,
  generateAICourse,
  checkDeepseekStatus,
  uploadVideoToLocal,
  serveLocalVideo,
} from "../controllers/courseController";
import { requireAuth } from "@clerk/express";
import path from "path";
import fs from "fs";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configure multer for video uploads to local storage
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const videoDir = path.join(__dirname, "../../../video");
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const { courseId, sectionId, chapterId } = req.params;
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${courseId}_${sectionId}_${chapterId}_${uniqueId}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, filename);
  }
});

const videoUpload = multer({ 
  storage: videoStorage,
  fileFilter: (_req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      const error = new Error('Only video files are allowed!') as any;
      error.code = 'LIMIT_FILE_TYPES';
      cb(error, false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

router.get("/", listCourses);
router.post("/", requireAuth(), createCourse);
router.post("/ai-generate", requireAuth(), generateAICourse);
router.get("/ai-status", requireAuth(), checkDeepseekStatus);

router.get("/:courseId", getCourse);
router.put("/:courseId", requireAuth(), upload.single("image"), updateCourse);
router.delete("/:courseId", requireAuth(), deleteCourse);

router.post(
  "/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url",
  requireAuth(),
  getUploadVideoUrl
);

// New route for local video upload
router.post(
  "/:courseId/sections/:sectionId/chapters/:chapterId/upload-video",
  requireAuth(),
  videoUpload.single("video"),
  uploadVideoToLocal
);

// Route to serve local videos
router.get("/local-video/:filename", serveLocalVideo);

// Mock endpoints cho môi trường local không có AWS S3
if (process.env.NODE_ENV !== "production") {
  console.log("Setting up mock video endpoints for local development");
  
  // Tạo thư mục mock nếu chưa tồn tại
  const mockDir = path.join(__dirname, "../../mock-uploads");
  if (!fs.existsSync(mockDir)) {
    try {
      fs.mkdirSync(mockDir, { recursive: true });
      console.log("Created mock uploads directory:", mockDir);
    } catch (err) {
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

export default router;