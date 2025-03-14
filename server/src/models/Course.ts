import { Schema, model } from "dynamoose";

// Course schema for the course recommendation system
const courseSchema = new Schema(
  {
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
      enum: ["beginner", "intermediate", "advanced"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Published"],
    }
  },
  {
    timestamps: true,
  }
);

// Export as named export for simpler importing
export const CourseModel = model("Course", courseSchema); 