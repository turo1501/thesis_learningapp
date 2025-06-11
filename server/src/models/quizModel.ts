import { Schema, model } from "dynamoose";

const quizOptionSchema = new Schema({
  optionId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
  explanation: {
    type: String,
    required: false, // Optional explanation for why this option is correct/incorrect
  }
});

const quizQuestionSchema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "fill-in-blank", "short-answer", "matching"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    schema: [quizOptionSchema],
    required: false, // Not needed for fill-in-blank or short-answer
  },
  correctAnswer: {
    type: String,
    required: false, // Used for fill-in-blank, short-answer
  },
  points: {
    type: Number,
    required: true,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
    default: "medium",
  },
  explanation: {
    type: String,
    required: false, // Detailed explanation of the correct answer
  },
  hints: {
    type: Array,
    schema: [String],
    required: false,
    default: [],
  },
  timeLimit: {
    type: Number,
    required: false, // Time limit in seconds for this question
  },
  tags: {
    type: Array,
    schema: [String],
    required: false,
    default: [],
  },
  imageUrl: {
    type: String,
    required: false, // Optional image for the question
  },
  videoUrl: {
    type: String,
    required: false, // Optional video for the question
  }
});

const quizSchema = new Schema(
  {
    quizId: {
      type: String,
      hashKey: true,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
      index: {
        name: "courseId-index",
        type: "global"
      }
    },
    sectionId: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
    questions: {
      type: Array,
      schema: [quizQuestionSchema],
      required: true,
    },
    settings: {
      type: Object,
      schema: new Schema({
        timeLimit: {
          type: Number,
          required: false, // Total time limit in minutes
        },
        shuffleQuestions: {
          type: Boolean,
          default: false,
        },
        shuffleOptions: {
          type: Boolean,
          default: false,
        },
        showResultsImmediately: {
          type: Boolean,
          default: true,
        },
        allowRetake: {
          type: Boolean,
          default: true,
        },
        maxAttempts: {
          type: Number,
          default: 3,
        },
        passingScore: {
          type: Number,
          default: 70, // Percentage required to pass
        },
        showCorrectAnswers: {
          type: Boolean,
          default: true,
        },
        showExplanations: {
          type: Boolean,
          default: true,
        },
        randomizeFromPool: {
          type: Boolean,
          default: false,
        },
        questionsPerAttempt: {
          type: Number,
          required: false, // If randomizing, how many questions to show
        }
      }),
      required: false,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      required: true,
      default: "medium",
    },
    tags: {
      type: Array,
      schema: [String],
      required: false,
      default: [],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdBy: {
      type: String,
      required: true, // Teacher/creator user ID
    },
    analytics: {
      type: Object,
      schema: new Schema({
        totalAttempts: {
          type: Number,
          default: 0,
        },
        averageScore: {
          type: Number,
          default: 0,
        },
        averageTimeSpent: {
          type: Number,
          default: 0, // in seconds
        },
        passRate: {
          type: Number,
          default: 0, // percentage of users who passed
        },
        mostMissedQuestions: {
          type: Array,
          schema: [String], // question IDs
          default: [],
        },
        lastUpdated: {
          type: String,
          default: () => new Date().toISOString(),
        }
      }),
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const Quiz = model("Quiz", quizSchema);

export default Quiz; 