import { Schema, model } from "dynamoose";

// Define submission schema
const submissionSchema = new Schema({
  studentId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  submissionDate: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: {
    type: Array,
    schema: [String],
    default: [],
  },
  grade: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  status: {
    type: String,
    enum: ["submitted", "graded"],
    default: "submitted",
  },
});

// Define assignment schema
const assignmentSchema = new Schema(
  {
    assignmentId: {
      type: String,
      hashKey: true,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
      index: {
        name: "courseIndex",
      },
    },
    teacherId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    submissions: {
      type: Array,
      schema: [submissionSchema],
      default: [],
    },
    attachments: {
      type: Array,
      schema: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

const Assignment = model("Assignment", assignmentSchema);
export default Assignment;
