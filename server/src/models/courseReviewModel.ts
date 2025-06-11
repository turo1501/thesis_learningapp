import { Schema, model } from "dynamoose";

const courseReviewSchema = new Schema(
  {
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
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: true,
      // Rating from 1 to 5
      validate: (value: number) => value >= 1 && value <= 5,
    },
    reviewText: {
      type: String,
      required: false,
    },
    // Categories for detailed ratings
    contentQuality: {
      type: Number,
      required: false,
      validate: (value: number) => value >= 1 && value <= 5,
    },
    instructorEngagement: {
      type: Number,
      required: false,
      validate: (value: number) => value >= 1 && value <= 5,
    },
    courseStructure: {
      type: Number,
      required: false,
      validate: (value: number) => value >= 1 && value <= 5,
    },
    // Metrics for helpfulness
    helpfulCount: {
      type: Number,
      required: false,
      default: 0,
    },
    // Users who marked this review as helpful
    helpfulUsers: {
      type: Array,
      schema: [String],
      required: false,
      default: [],
    },
    // Progress achieved when review was written
    progressPercentage: {
      type: Number,
      required: false,
    },
    // Was the course completed when reviewed
    isCompletedReview: {
      type: Boolean,
      required: false,
      default: false,
    },
    verifiedPurchase: {
      type: Boolean,
      required: false,
      default: true,
    },
    createdAt: {
      type: String,
      required: false,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      required: false,
      default: () => new Date().toISOString(),
    },
  }
);

const CourseReview = model("CourseReview", courseReviewSchema);
export default CourseReview; 