"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoose_1 = require("dynamoose");
const commentSchema = new dynamoose_1.Schema({
    commentId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
});
const chapterSchema = new dynamoose_1.Schema({
    chapterId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Text", "Quiz", "Video"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    comments: {
        type: Array,
        schema: [commentSchema],
    },
    video: {
        type: String,
    },
});
const sectionSchema = new dynamoose_1.Schema({
    sectionId: {
        type: String,
        required: true,
    },
    sectionTitle: {
        type: String,
        required: true,
    },
    sectionDescription: {
        type: String,
    },
    chapters: {
        type: Array,
        schema: [chapterSchema],
    },
});
const courseSchema = new dynamoose_1.Schema({
    courseId: {
        type: String,
        hashKey: true,
        required: true,
    },
    teacherId: {
        type: String,
        required: true,
    },
    teacherName: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
    },
    level: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced"],
    },
    status: {
        type: String,
        required: true,
        enum: ["Draft", "Published"],
    },
    sections: {
        type: Array,
        schema: [sectionSchema],
    },
    enrollments: {
        type: Array,
        schema: [
            new dynamoose_1.Schema({
                userId: {
                    type: String,
                    required: true,
                },
            }),
        ],
    },
}, {
    timestamps: true,
});
const Course = (0, dynamoose_1.model)("Course", courseSchema);
exports.default = Course;
