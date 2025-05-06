import { Schema, model } from "dynamoose";

const cardSchema = new Schema({
  cardId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  chapterId: {
    type: String,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
  },
  difficultyLevel: {
    type: Number, // 1-5, 5 being the most difficult
    default: 3,
  },
  lastReviewed: {
    type: Number, // timestamp
    required: true,
    default: () => Date.now(),
  },
  nextReviewDue: {
    type: Number, // timestamp
    required: true,
    default: () => Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now by default
  },
  repetitionCount: {
    type: Number,
    default: 0,
  },
  correctCount: {
    type: Number,
    default: 0,
  },
  incorrectCount: {
    type: Number,
    default: 0,
  },
});

const memoryCardDeckSchema = new Schema(
  {
    deckId: {
      type: String,
      hashKey: true,
      required: true,
    },
    userId: {
      type: String,
      rangeKey: true,
      required: true,
    },
    courseId: {
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
    cards: {
      type: Array,
      schema: [cardSchema],
    },
    // Spaced repetition parameters
    intervalModifier: {
      type: Number,
      default: 1.0,
    },
    easyBonus: {
      type: Number,
      default: 1.3,
    },
    // Statistics
    totalReviews: {
      type: Number,
      default: 0,
    },
    correctReviews: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Number,
      default: () => Date.now(),
    },
    updatedAt: {
      type: Number,
      default: () => Date.now(),
    },
  }
);

const MemoryCardDeck = model("MemoryCardDeck", memoryCardDeckSchema);
export default MemoryCardDeck; 
 
 
 
 
 