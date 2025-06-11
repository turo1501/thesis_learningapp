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
    completedAt: {
        type: String,
        required: false,
    },
    watchTime: {
        type: Number,
        required: false,
        default: 0, // in seconds
    },
    quizScore: {
        type: Number,
        required: false,
        default: 0, // percentage score for quiz chapters
    },
    attempts: {
        type: Number,
        required: false,
        default: 0, // number of quiz attempts
    },
    timeSpent: {
        type: Number,
        required: false,
        default: 0, // total time spent on chapter in seconds
    },
    interactions: {
        type: Number,
        required: false,
        default: 0, // number of interactions (pauses, replays, etc.)
    },
    notesTaken: {
        type: Number,
        required: false,
        default: 0, // number of notes taken
    },
    engagementScore: {
        type: Number,
        required: false,
        default: 0, // calculated engagement score 0-100
    }
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
    sectionCompletedAt: {
        type: String,
        required: false,
    },
    averageScore: {
        type: Number,
        required: false,
        default: 0, // average quiz score for section
    },
    totalTimeSpent: {
        type: Number,
        required: false,
        default: 0, // total time spent in section
    }
});
const userCourseProgressSchema = new dynamoose_1.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        index: {
            name: "userId-index",
            type: "global"
        }
    },
    courseId: {
        type: String,
        required: true,
        index: {
            name: "courseId-index",
            type: "global"
        }
    },
    enrollmentDate: {
        type: String,
        required: false,
        default: () => new Date().toISOString(),
    },
    overallProgress: {
        type: Number,
        required: false,
        default: 0,
    },
    sections: {
        type: Array,
        schema: [sectionProgressSchema],
        required: false,
        default: [],
    },
    lastAccessedTimestamp: {
        type: String,
        required: false,
        default: () => new Date().toISOString(),
    },
    isPreview: {
        type: Boolean,
        required: false,
        default: false,
    },
    // Enhanced tracking fields
    totalWatchTime: {
        type: Number,
        required: false,
        default: 0, // total video watch time in seconds
    },
    totalQuizScore: {
        type: Number,
        required: false,
        default: 0, // average quiz score across all quizzes
    },
    streakDays: {
        type: Number,
        required: false,
        default: 0, // consecutive days accessing course
    },
    lastStreakDate: {
        type: String,
        required: false,
    },
    totalTimeSpent: {
        type: Number,
        required: false,
        default: 0, // total time spent in course
    },
    engagementLevel: {
        type: String,
        enum: ["low", "medium", "high", "excellent"],
        required: false,
        default: "medium",
    },
    completionRate: {
        type: Number,
        required: false,
        default: 0, // percentage of course completed
    },
    averageSessionDuration: {
        type: Number,
        required: false,
        default: 0, // average session length in minutes
    },
    sessionsCount: {
        type: Number,
        required: false,
        default: 0, // total number of study sessions
    },
    certificateEarned: {
        type: Boolean,
        required: false,
        default: false,
    },
    certificateEarnedAt: {
        type: String,
        required: false,
    },
    skillsAcquired: {
        type: Array,
        schema: [String],
        required: false,
        default: [],
    },
    achievements: {
        type: Array,
        schema: [new dynamoose_1.Schema({
                achievementId: String,
                title: String,
                description: String,
                unlockedAt: String,
                category: {
                    type: String,
                    enum: ["progress", "engagement", "quiz", "streak", "completion"]
                }
            })],
        required: false,
        default: [],
    },
    studyGoals: {
        type: Object,
        schema: new dynamoose_1.Schema({
            weeklyHours: {
                type: Number,
                default: 5
            },
            targetCompletionDate: {
                type: String,
                required: false
            },
            dailyChapters: {
                type: Number,
                default: 1
            }
        }),
        required: false,
    },
    performanceMetrics: {
        type: Object,
        schema: new dynamoose_1.Schema({
            focusScore: {
                type: Number,
                default: 0, // 0-100 based on session patterns
            },
            retentionRate: {
                type: Number,
                default: 0, // how well user retains information
            },
            improvementTrend: {
                type: String,
                enum: ["improving", "stable", "declining"],
                default: "stable"
            },
            lastCalculatedAt: {
                type: String,
                default: () => new Date().toISOString()
            }
        }),
        required: false,
    }
}, {
    timestamps: true,
});
const UserCourseProgress = (0, dynamoose_1.model)("UserCourseProgress", userCourseProgressSchema);
exports.default = UserCourseProgress;
