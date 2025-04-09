import { Schema, model } from "dynamoose";

// Define student schema for meeting participants
const participantSchema = new Schema({
  studentId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "pending", "cancelled"],
    default: "pending",
  },
});

// Define meeting schema
const meetingSchema = new Schema(
  {
    meetingId: {
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
    courseId: {
      type: String,
      index: {
        name: "courseIndex",
      },
    },
    courseName: {
      type: String,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    }, // duration in minutes
    type: {
      type: String,
      enum: ["individual", "group"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "pending"],
      default: "pending",
    },
    meetingLink: {
      type: String,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    participants: {
      type: Array,
      schema: [participantSchema],
      default: [],
    },
    recordings: {
      type: Array,
      schema: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Meeting = model("Meeting", meetingSchema);
export default Meeting;
