"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoose_1 = require("dynamoose");
const chapterProgressSchema = new dynamoose_1.Schema({
    chapterId: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
    },
});
const sectionProgressSchema = new dynamoose_1.Schema({
    sectionId: {
        type: String,
        required: true,
    },
    chapters: {
        type: Array,
        schema: [chapterProgressSchema],
    },
});
const userCourseProgressSchema = new dynamoose_1.Schema({
    userId: {
        type: String,
        hashKey: true,
        required: true,
    },
    courseId: {
        type: String,
        rangeKey: true,
        required: true,
    },
    enrollmentDate: {
        type: String,
        required: true,
    },
    overallProgress: {
        type: Number,
        required: true,
    },
    sections: {
        type: Array,
        schema: [sectionProgressSchema],
    },
    lastAccessedTimestamp: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const UserCourseProgress = (0, dynamoose_1.model)("UserCourseProgress", userCourseProgressSchema);
exports.default = UserCourseProgress;
