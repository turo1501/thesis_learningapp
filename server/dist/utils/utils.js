"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOverallProgress = exports.mergeChapters = exports.mergeSections = exports.handleAdvancedVideoUpload = exports.getContentType = exports.validateUploadedFiles = exports.updateCourseVideoInfo = void 0;
const path_1 = __importDefault(require("path"));
const updateCourseVideoInfo = (course, sectionId, chapterId, videoUrl) => {
    var _a, _b;
    const section = (_a = course.sections) === null || _a === void 0 ? void 0 : _a.find((s) => s.sectionId === sectionId);
    if (!section) {
        throw new Error(`Section not found: ${sectionId}`);
    }
    const chapter = (_b = section.chapters) === null || _b === void 0 ? void 0 : _b.find((c) => c.chapterId === chapterId);
    if (!chapter) {
        throw new Error(`Chapter not found: ${chapterId}`);
    }
    chapter.video = videoUrl;
    chapter.type = "Video";
};
exports.updateCourseVideoInfo = updateCourseVideoInfo;
const validateUploadedFiles = (files) => {
    const allowedExtensions = [".mp4", ".m3u8", ".mpd", ".ts", ".m4s"];
    for (const file of files) {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            throw new Error(`Unsupported file type: ${ext}`);
        }
    }
};
exports.validateUploadedFiles = validateUploadedFiles;
const getContentType = (filename) => {
    const ext = path_1.default.extname(filename).toLowerCase();
    switch (ext) {
        case ".mp4":
            return "video/mp4";
        case ".m3u8":
            return "application/vnd.apple.mpegurl";
        case ".mpd":
            return "application/dash+xml";
        case ".ts":
            return "video/MP2T";
        case ".m4s":
            return "video/iso.segment";
        default:
            return "application/octet-stream";
    }
};
exports.getContentType = getContentType;
// Preserved HLS/DASH upload logic for future use
const handleAdvancedVideoUpload = (s3, files, uniqueId, bucketName) => __awaiter(void 0, void 0, void 0, function* () {
    const isHLSOrDASH = files.some((file) => file.originalname.endsWith(".m3u8") || file.originalname.endsWith(".mpd"));
    if (isHLSOrDASH) {
        // Handle HLS/MPEG-DASH Upload
        const uploadPromises = files.map((file) => {
            const s3Key = `videos/${uniqueId}/${file.originalname}`;
            return s3
                .upload({
                Bucket: bucketName,
                Key: s3Key,
                Body: file.buffer,
                ContentType: (0, exports.getContentType)(file.originalname),
            })
                .promise();
        });
        yield Promise.all(uploadPromises);
        // Determine manifest file URL
        const manifestFile = files.find((file) => file.originalname.endsWith(".m3u8") ||
            file.originalname.endsWith(".mpd"));
        const manifestFileName = (manifestFile === null || manifestFile === void 0 ? void 0 : manifestFile.originalname) || "";
        const videoType = manifestFileName.endsWith(".m3u8") ? "hls" : "dash";
        return {
            videoUrl: `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${manifestFileName}`,
            videoType,
        };
    }
    return null; // Return null if not HLS/DASH to handle regular upload
});
exports.handleAdvancedVideoUpload = handleAdvancedVideoUpload;
const mergeSections = (existingSections, newSections) => {
    const existingSectionsMap = new Map();
    for (const existingSection of existingSections) {
        existingSectionsMap.set(existingSection.sectionId, existingSection);
    }
    for (const newSection of newSections) {
        const section = existingSectionsMap.get(newSection.sectionId);
        if (!section) {
            // Add new section
            existingSectionsMap.set(newSection.sectionId, newSection);
        }
        else {
            // Merge chapters within the existing section
            section.chapters = (0, exports.mergeChapters)(section.chapters, newSection.chapters);
            existingSectionsMap.set(newSection.sectionId, section);
        }
    }
    return Array.from(existingSectionsMap.values());
};
exports.mergeSections = mergeSections;
const mergeChapters = (existingChapters, newChapters) => {
    const existingChaptersMap = new Map();
    for (const existingChapter of existingChapters) {
        existingChaptersMap.set(existingChapter.chapterId, existingChapter);
    }
    for (const newChapter of newChapters) {
        existingChaptersMap.set(newChapter.chapterId, Object.assign(Object.assign({}, (existingChaptersMap.get(newChapter.chapterId) || {})), newChapter));
    }
    return Array.from(existingChaptersMap.values());
};
exports.mergeChapters = mergeChapters;
const calculateOverallProgress = (sections) => {
    const totalChapters = sections.reduce((acc, section) => acc + section.chapters.length, 0);
    const completedChapters = sections.reduce((acc, section) => acc + section.chapters.filter((chapter) => chapter.completed).length, 0);
    return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
};
exports.calculateOverallProgress = calculateOverallProgress;
