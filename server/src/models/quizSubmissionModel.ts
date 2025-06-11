import { Schema, model } from "dynamoose";

const submissionAnswerSchema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: false, // Can be empty if user skipped
  },
  selectedOptions: {
    type: Array,
    schema: [String], // For multiple-choice questions
    required: false,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  pointsEarned: {
    type: Number,
    required: true,
    default: 0,
  },
  timeSpent: {
    type: Number,
    required: false, // Time spent on this question in seconds
  },
  hintsUsed: {
    type: Number,
    required: false,
    default: 0,
  }
});

const quizSubmissionSchema = new Schema(
  {
    submissionId: {
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
    quizId: {
      type: String,
      required: true,
      index: {
        name: "quizId-index",
        type: "global"
      }
    },
    courseId: {
      type: String,
      required: true,
    },
    sectionId: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    answers: {
      type: Array,
      schema: [submissionAnswerSchema],
      required: true,
    },
    score: {
      type: Number,
      required: true, // Points earned
    },
    percentage: {
      type: Number,
      required: true, // Percentage score
    },
    totalPoints: {
      type: Number,
      required: true, // Total possible points
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true, // Total time in seconds
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "timed-out", "abandoned"],
      required: true,
      default: "in-progress",
    },
    startedAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
    },
    completedAt: {
      type: String,
      required: false,
    },
    submittedAt: {
      type: String,
      required: false,
    },
    feedback: {
      type: Object,
      schema: new Schema({
        overallFeedback: {
          type: String,
          required: false,
        },
        strengthAreas: {
          type: Array,
          schema: [String],
          default: [],
        },
        improvementAreas: {
          type: Array,
          schema: [String],
          default: [],
        },
        suggestedResources: {
          type: Array,
          schema: [String],
          default: [],
        },
        nextSteps: {
          type: String,
          required: false,
        }
      }),
      required: false,
    },
    analytics: {
      type: Object,
      schema: new Schema({
        questionStats: {
          type: Array,
          schema: [new Schema({
            questionId: String,
            difficulty: String,
            timeSpent: Number,
            attempts: Number,
            correct: Boolean
          })],
          default: [],
        },
        behaviorMetrics: {
          type: Object,
          schema: new Schema({
            averageTimePerQuestion: Number,
            questionsRevisited: Number,
            hintsUsedTotal: Number,
            pauseCount: Number,
            focusScore: Number, // 0-100 based on behavior patterns
          }),
          required: false,
        },
        performanceByTopic: {
          type: Array,
          schema: [new Schema({
            topic: String,
            correctAnswers: Number,
            totalQuestions: Number,
            percentage: Number
          })],
          default: [],
        }
      }),
      required: false,
    },
    deviceInfo: {
      type: Object,
      schema: new Schema({
        userAgent: String,
        platform: String,
        screenResolution: String,
        timezone: String
      }),
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const QuizSubmission = model("QuizSubmission", quizSubmissionSchema);

export default QuizSubmission; 