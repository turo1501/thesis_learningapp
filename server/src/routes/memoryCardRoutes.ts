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
  addCardsBatch,
  submitCardReview,
  debugDeckStatus,
} from "../controllers/memoryCardController";
import { authenticate } from "../middleware/authMiddleware";
import MemoryCardDataProtection from "../middleware/memoryCardDataProtection";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth());
router.use(authenticate);

// Apply data protection middleware to all write operations
router.use(MemoryCardDataProtection.protectMemoryCardOperation());
router.use(MemoryCardDataProtection.validateAfterOperation());

// Health check endpoints
router.get("/health", MemoryCardDataProtection.healthCheck);
router.post("/repair", MemoryCardDataProtection.emergencyRepair);

// Deck management routes
router.get("/:userId", getUserDecks);
router.get("/:userId/:deckId", getDeck);
router.post("/", createDeck);
router.delete("/:userId/:deckId", deleteDeck);

// Card management routes
router.post("/:userId/:deckId/cards", addCard);
router.post("/:userId/:deckId/cards/batch", addCardsBatch as unknown as express.RequestHandler);
router.put("/:userId/:deckId/cards/:cardId", updateCard);
router.delete("/:userId/:deckId/cards/:cardId", deleteCard);

// Review routes
router.get("/:userId/due-cards", getDueCards);
router.post("/:userId/:deckId/cards/:cardId/review", submitReview);
router.post("/:userId/:deckId/cards/:cardId/review-v2", submitCardReview as unknown as express.RequestHandler);

// Debug route (should be removed in production)
router.get("/:userId/:deckId/debug", debugDeckStatus);

// AI-assisted generation routes
router.post("/generate", generateCardsFromCourse);
router.post("/:userId/alternatives", generateAIAlternatives);

export default router; 
 
 
 