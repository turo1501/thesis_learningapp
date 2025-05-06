import { Schema, model } from "dynamoose";

const userNoteSchema = new Schema(
  {
    noteId: {
      type: String,
      hashKey: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: "userIndex",
        type: "global",
      },
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
    content: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#FFFFFF",
    },
  },
  {
    timestamps: true,
  }
);

const UserNote = model("UserNote", userNoteSchema);
export default UserNote; 