import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserDecks,
  getDeck,
  createDeck,
  addCard,
  updateCard,
  deleteCard,
  deleteDeck,
  getDueCards,
  submitReview,
  generateCardsFromCourse,
  generateAIAlternatives,
} from "../controllers/memoryCardController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth());
router.use(authenticate);

// Deck management routes
router.get("/:userId", getUserDecks);
router.get("/:userId/:deckId", getDeck);
router.post("/", createDeck);
router.delete("/:userId/:deckId", deleteDeck);

// Card management routes
router.post("/:userId/:deckId/cards", addCard);
router.put("/:userId/:deckId/cards/:cardId", updateCard);
router.delete("/:userId/:deckId/cards/:cardId", deleteCard);

// Review routes
router.get("/:userId/due-cards", getDueCards);
router.post("/:userId/:deckId/cards/:cardId/review", submitReview);

// AI-assisted generation routes
router.post("/generate", generateCardsFromCourse);
router.post("/:userId/ai-alternatives", generateAIAlternatives);

export default router; 
 
 
 