"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const courseController_1 = require("../controllers/courseController");
const express_2 = require("@clerk/express");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/", courseController_1.listCourses);
router.post("/", (0, express_2.requireAuth)(), courseController_1.createCourse);
router.get("/:courseId", courseController_1.getCourse);
router.put("/:courseId", (0, express_2.requireAuth)(), upload.single("image"), courseController_1.updateCourse);
router.delete("/:courseId", (0, express_2.requireAuth)(), courseController_1.deleteCourse);
router.post("/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url", (0, express_2.requireAuth)(), courseController_1.getUploadVideoUrl);
exports.default = router;
