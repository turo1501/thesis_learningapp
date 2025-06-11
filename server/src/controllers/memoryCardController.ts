import { Request, Response } from "express";
import MemoryCardDeck from "../models/memoryCardModel";
import Course from "../models/courseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import { v4 as uuidv4 } from "uuid";
import AIContentAnalyzer from "../utils/aiContentAnalyzer";

// Define model interfaces for type safety
interface MemoryCardDeckModel {
  deckId: string;
  userId: string;
  courseId: string;
  title: string;
  description?: string;
  cards: MemoryCard[];
  intervalModifier: number;
  easyBonus: number;
  totalReviews: number;
  correctReviews: number;
  createdAt: number;
  updatedAt: number;
  save(): Promise<MemoryCardDeckModel>;
}

interface CourseModel {
  courseId: string;
  title: string;
  enrollments?: Enrollment[];
  sections?: CourseSection[];
}

interface UserCourseProgressModel {
  userId: string;
  courseId: string;
  sections?: UserProgressSection[];
}

interface Enrollment {
  userId: string;
  status: string;
  enrolledAt: number;
}

// Define card types for better type safety
interface MemoryCard {
  cardId: string;
  question: string;
  answer: string;
  chapterId: string;
  sectionId: string;
  difficultyLevel: number;
  lastReviewed: number;
  nextReviewDue: number;
  repetitionCount: number;
  correctCount: number;
  incorrectCount: number;
  aiGenerated?: boolean;
  // Enhanced tracking properties
  averageThinkingTime?: number;
  lastConfidence?: number;
}

interface CourseSection {
  sectionId: string;
  title: string;
  chapters: CourseChapter[];
}

interface CourseChapter {
  chapterId: string;
  title: string;
  type: string;
  content?: string;
}

interface UserProgressSection {
  sectionId: string;
  chapters: {
    chapterId: string;
    completed: boolean;
  }[];
}

// Helper function to calculate next review date using spaced repetition algorithm
const calculateNextReview = (
  difficultyRating: number, // 1-4, with 1 being the easiest
  repetitionCount: number,
  intervalModifier: number = 1.0,
  easyBonus: number = 1.3
): number => {
  // Simple implementation of SM-2 algorithm
  let interval = 0;
  let easeFactor = 2.5; // Initial ease factor

  if (repetitionCount === 0) {
    interval = 1; // 1 day
  } else if (repetitionCount === 1) {
    interval = 6; // 6 days
  } else {
    // Adjust ease factor based on performance
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (4 - difficultyRating) * (0.08 + (4 - difficultyRating) * 0.02)));
    
    // Calculate interval
    if (repetitionCount === 2) {
      interval = 6 * easeFactor;
    } else {
      // Previous interval * ease factor
      interval = repetitionCount * easeFactor * intervalModifier;
      
      // Apply easy bonus if rating is excellent
      if (difficultyRating === 1) {
        interval *= easyBonus;
      }
    }
  }

  // Convert days to milliseconds and add to current time
  return Date.now() + Math.round(interval * 24 * 60 * 60 * 1000);
};

// Helper function for data backup before critical operations
const createDataBackup = (deck: MemoryCardDeckModel, operation: string) => {
  console.log(`Creating backup before ${operation}: deckId=${deck.deckId}, cards=${deck.cards?.length || 0}`);
  return {
    deckId: deck.deckId,
    userId: deck.userId,
    cards: JSON.parse(JSON.stringify(deck.cards || [])),
    totalReviews: deck.totalReviews,
    correctReviews: deck.correctReviews,
    timestamp: Date.now(),
    operation
  };
};

// Helper function to validate card data integrity
const validateCardData = (card: MemoryCard): string[] => {
  const errors: string[] = [];
  
  if (!card.cardId) errors.push("Card ID is missing");
  if (!card.question || card.question.trim().length === 0) errors.push("Question is empty");
  if (!card.answer || card.answer.trim().length === 0) errors.push("Answer is empty");
  if (card.difficultyLevel < 1 || card.difficultyLevel > 5) errors.push("Difficulty level must be 1-5");
  if (card.repetitionCount < 0) errors.push("Repetition count cannot be negative");
  if (card.correctCount < 0) errors.push("Correct count cannot be negative");
  if (card.incorrectCount < 0) errors.push("Incorrect count cannot be negative");
  if (card.lastReviewed <= 0) errors.push("Last reviewed timestamp is invalid");
  if (card.nextReviewDue <= 0) errors.push("Next review due timestamp is invalid");
  
  return errors;
};

// Helper function to validate deck data integrity
const validateDeckData = (deck: MemoryCardDeckModel): string[] => {
  const errors: string[] = [];
  
  if (!deck.deckId) errors.push("Deck ID is missing");
  if (!deck.userId) errors.push("User ID is missing");
  if (!deck.title || deck.title.trim().length === 0) errors.push("Deck title is empty");
  if (deck.totalReviews < 0) errors.push("Total reviews cannot be negative");
  if (deck.correctReviews < 0) errors.push("Correct reviews cannot be negative");
  if (deck.correctReviews > deck.totalReviews) errors.push("Correct reviews cannot exceed total reviews");
  
  if (deck.cards && Array.isArray(deck.cards)) {
    deck.cards.forEach((card: MemoryCard, index: number) => {
      const cardErrors = validateCardData(card);
      cardErrors.forEach(error => errors.push(`Card ${index + 1}: ${error}`));
    });
  }
  
  return errors;
};

// Get all decks for a user
export const getUserDecks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own decks or has admin access
    if ((req as any).user?.id !== userId && (req as any).user?.role !== "admin") {
      res.status(403).json({ message: "Unauthorized access to user decks" });
      return;
    }

    const decks = await MemoryCardDeck.scan("userId").eq(userId).exec();

    res.json({
      message: "Memory card decks retrieved successfully",
      data: decks,
    });
  } catch (error) {
    console.error("Error retrieving memory card decks:", error);
    res.status(500).json({ message: "Error retrieving memory card decks", error });
  }
};

// Get a specific deck
export const getDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, userId } = req.params;

    // Verify user is accessing their own deck or has admin access
    if ((req as any).user?.id !== userId && (req as any).user?.role !== "admin") {
      res.status(403).json({ message: "Unauthorized access to deck" });
      return;
    }

    const deck = await MemoryCardDeck.get({
      deckId,
      userId,
    });

    if (!deck) {
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    res.json({
      message: "Memory card deck retrieved successfully",
      data: deck,
    });
  } catch (error) {
    console.error("Error retrieving memory card deck:", error);
    res.status(500).json({ message: "Error retrieving memory card deck", error });
  }
};

// Create a new deck
export const createDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId, title, description } = req.body;

    // Validate required parameters
    if (!userId || userId === 'undefined' || userId === 'null') {
      res.status(400).json({ message: "Invalid user ID provided" });
      return;
    }

    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      res.status(400).json({ message: "Invalid course ID provided" });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Deck title is required" });
      return;
    }

    // Verify user is creating their own deck
    if ((req as any).user?.id !== userId) {
      console.error(`Auth mismatch: Request user ${(req as any).user?.id} !== ${userId}`);
      res.status(403).json({ message: "Unauthorized deck creation" });
      return;
    }

    // Log parameters for debugging
    console.log(`Creating deck: title=${title}, userId=${userId}, courseId=${courseId}`);

    // Verify the course exists
    const course = await Course.get(courseId) as unknown as CourseModel | null;
    if (!course) {
      console.error(`Course not found: courseId=${courseId}`);
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // For development/testing environment, we may want to skip enrollment check
    const skipEnrollmentCheck = process.env.NODE_ENV === 'development' && process.env.SKIP_ENROLLMENT_CHECK === 'true';
    
    // Verify user is enrolled in the course (unless we're skipping the check)
    if (!skipEnrollmentCheck) {
      const isEnrolled = course.enrollments?.some(
        (enrollment: Enrollment) => enrollment.userId === userId
      );
  
      if (!isEnrolled) {
        console.error(`User not enrolled: userId=${userId}, courseId=${courseId}`);
        res.status(403).json({ message: "User is not enrolled in this course" });
        return;
      }
    }

    // Generate a unique ID for the deck
    const deckId = uuidv4();
    
    const newDeck = new MemoryCardDeck({
      deckId,
      userId,
      courseId,
      title,
      description: description || `Memory cards for ${title}`,
      cards: [],
      intervalModifier: 1.0,
      easyBonus: 1.3,
      totalReviews: 0,
      correctReviews: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await newDeck.save();

    console.log(`Deck created successfully: deckId=${deckId}, userId=${userId}`);

    res.status(201).json({
      message: "Memory card deck created successfully",
      data: newDeck,
    });
  } catch (error) {
    console.error("Error creating memory card deck:", error);
    res.status(500).json({ message: "Error creating memory card deck", error });
  }
};

// Add a card to a deck
export const addCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, userId } = req.params;
    const { 
      question, 
      answer, 
      chapterId, 
      sectionId, 
      difficultyLevel,
      lastReviewed,
      nextReviewDue,
      repetitionCount = 0,
      correctCount = 0,
      incorrectCount = 0,
      aiGenerated = false
    } = req.body;

    // Validate required parameters
    if (!deckId || deckId === 'undefined' || deckId === 'null') {
      res.status(400).json({ message: "Invalid deck ID provided" });
      return;
    }

    if (!userId || userId === 'undefined' || userId === 'null') {
      res.status(400).json({ message: "Invalid user ID provided" });
      return;
    }

    if (!question || !answer) {
      res.status(400).json({ message: "Question and answer are required" });
      return;
    }

    // Sanitize input data
    const sanitizedQuestion = question.trim();
    const sanitizedAnswer = answer.trim();

    if (sanitizedQuestion.length === 0 || sanitizedAnswer.length === 0) {
      res.status(400).json({ message: "Question and answer cannot be empty" });
      return;
    }

    // Verify user is modifying their own deck
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized deck modification" });
      return;
    }

    // Log parameters for debugging
    console.log(`Adding card to deck: ${deckId} for user: ${userId}`);

    // Get the deck with retries for better reliability
    let deck: MemoryCardDeckModel | null = null;
    let retries = 3;
    
    while (retries > 0 && !deck) {
      try {
        deck = await MemoryCardDeck.get({
      deckId,
      userId,
    }) as unknown as MemoryCardDeckModel | null;
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.warn(`Retry getting deck, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!deck) {
      console.error(`Deck not found: deckId=${deckId}, userId=${userId}`);
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    // Create new card with enhanced validation
    const newCard: MemoryCard = {
      cardId: uuidv4(),
      question: sanitizedQuestion,
      answer: sanitizedAnswer,
      chapterId: chapterId || 'default',
      sectionId: sectionId || 'default',
      difficultyLevel: Math.min(5, Math.max(1, difficultyLevel || 3)),
      lastReviewed: lastReviewed || Date.now(),
      nextReviewDue: nextReviewDue || (Date.now() + 24 * 60 * 60 * 1000),
      repetitionCount: Math.max(0, repetitionCount || 0),
      correctCount: Math.max(0, correctCount || 0),
      incorrectCount: Math.max(0, incorrectCount || 0),
      aiGenerated: Boolean(aiGenerated),
    };

    // Add card to deck with data validation
    const cards = Array.isArray(deck.cards) ? deck.cards : [];
    
    // Check for duplicate cards
    const existingCard = cards.find((c: MemoryCard) => 
      c.question.toLowerCase().trim() === sanitizedQuestion.toLowerCase() &&
      c.answer.toLowerCase().trim() === sanitizedAnswer.toLowerCase()
    );

    if (existingCard) {
      res.status(409).json({ 
        message: "A card with similar question and answer already exists",
        duplicateCardId: existingCard.cardId
      });
      return;
    }

    cards.push(newCard);

    // Update deck with transaction-like behavior
    const updateData = {
      cards,
      updatedAt: Date.now(),
    };

    try {
    await MemoryCardDeck.update(
      {
        deckId,
        userId,
      },
        updateData
    );

      console.log(`Card added successfully: cardId=${newCard.cardId} to deck ${deckId}`);

    res.json({
      message: "Card added successfully",
      data: {
        card: newCard,
        deckId,
        deckTitle: deck.title,
          totalCards: cards.length,
      },
    });
    } catch (updateError) {
      console.error("Error updating deck with new card:", updateError);
      res.status(500).json({ 
        message: "Failed to save card to deck", 
        error: "Database update failed",
        details: process.env.NODE_ENV === 'development' ? updateError : undefined
      });
    }
  } catch (error) {
    console.error("Error adding card to deck:", error);
    res.status(500).json({ 
      message: "Error adding card to deck", 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update a card
export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, userId, cardId } = req.params;
    const { question, answer, difficultyLevel } = req.body;

    // Verify user is modifying their own deck
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized card modification" });
      return;
    }

    // Get the deck
    const deck = await MemoryCardDeck.get({
      deckId,
      userId,
    }) as unknown as MemoryCardDeckModel | null;

    if (!deck) {
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    // Find the card
    const cards = deck.cards || [];
    const cardIndex = cards.findIndex((c: { cardId: string }) => c.cardId === cardId);

    if (cardIndex === -1) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // Update card
    if (question) cards[cardIndex].question = question;
    if (answer) cards[cardIndex].answer = answer;
    if (difficultyLevel) cards[cardIndex].difficultyLevel = difficultyLevel;

    // Update deck
    await MemoryCardDeck.update(
      {
        deckId,
        userId,
      },
      {
        cards,
        updatedAt: Date.now(),
      }
    );

    res.json({
      message: "Card updated successfully",
      data: cards[cardIndex],
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Error updating card", error });
  }
};

// Delete a card
export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, userId, cardId } = req.params;

    // Verify user is modifying their own deck
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized card deletion" });
      return;
    }

    // Get the deck
    const deck = await MemoryCardDeck.get({
      deckId,
      userId,
    }) as unknown as MemoryCardDeckModel | null;

    if (!deck) {
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    // Remove the card
    const cards = deck.cards || [];
    const updatedCards = cards.filter((card: MemoryCard) => card.cardId !== cardId);

    if (cards.length === updatedCards.length) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // Update deck
    await MemoryCardDeck.update(
      {
        deckId,
        userId,
      },
      {
        cards: updatedCards,
        updatedAt: Date.now(),
      }
    );

    res.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ message: "Error deleting card", error });
  }
};

// Delete a deck
export const deleteDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, userId } = req.params;

    // Verify user is deleting their own deck
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized deck deletion" });
      return;
    }

    // Delete the deck
    await MemoryCardDeck.delete({
      deckId,
      userId,
    });

    res.json({
      message: "Deck deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deck:", error);
    res.status(500).json({ message: "Error deleting deck", error });
  }
};

// Get due cards for review
export const getDueCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 20, courseId, deckId } = req.query;

    console.log(`Received due cards request with params: userId=${userId}, courseId=${courseId}, deckId=${deckId}, limit=${limit}`);

    // Verify user is requesting their own cards
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized access to review cards" });
      return;
    }

    // Check if specific deck is requested
    if (deckId) {
      // When deckId is provided, get cards from only that deck
      console.log(`Fetching cards for specific deck: ${deckId} by user: ${userId}`);
      
      let deck: MemoryCardDeckModel | null = null;
      
      try {
        deck = await MemoryCardDeck.get({
        deckId: deckId as string,
        userId,
      }) as unknown as MemoryCardDeckModel | null;

      if (!deck) {
          console.error(`Deck not found with deckId=${deckId} and userId=${userId}`);
          console.log(`Attempting to find any deck with deckId=${deckId} regardless of userId for debugging...`);
          
          // Debug: Try to find the deck regardless of userId to see if it exists
          try {
            const allDecksWithId = await MemoryCardDeck.scan("deckId").eq(deckId as string).exec();
            console.log(`Found ${allDecksWithId.length} decks with deckId=${deckId}:`, allDecksWithId.map(d => ({ deckId: d.deckId, userId: d.userId, title: d.title })));
          } catch (debugError) {
            console.error(`Debug scan failed:`, debugError);
          }
          
        res.status(404).json({ message: "Deck not found" });
          return;
        }
      } catch (error) {
        console.error(`Error fetching deck ${deckId} for user ${userId}:`, error);
        res.status(500).json({ message: "Error retrieving deck", error });
        return;
      }

      console.log(`Found deck: ${deck.deckId}, title: ${deck.title}`);
      
      // Check if cards array exists and is valid
      if (!deck.cards) {
        console.log(`Deck ${deckId} has no cards array, initializing empty array`);
        deck.cards = [];
      } else if (!Array.isArray(deck.cards)) {
        console.error(`Deck ${deckId} has invalid cards property: ${typeof deck.cards}`);
        deck.cards = [];
      }
      
      console.log(`Deck has ${deck.cards.length} total cards`);
      
      // Filter due cards from this specific deck
      const now = Date.now();
      const dueCards = (deck.cards || [])
        .filter((card: MemoryCard) => {
          // Cards without nextReviewDue are always due (new cards)
          const isDue = !card.nextReviewDue || card.nextReviewDue <= now;
          
          if (!isDue) {
            console.log(`Card ${card.cardId} is not due, next review at ${new Date(card.nextReviewDue).toISOString()}`);
          }
          
          return isDue;
        })
        .map((card: MemoryCard) => ({
          ...card,
          deckId: deck!.deckId,
          deckTitle: deck!.title,
          courseId: deck!.courseId,
        }))
        .sort((a, b) => {
          // If nextReviewDue is null, treat it as highest priority
          if (!a.nextReviewDue) return -1;
          if (!b.nextReviewDue) return 1;
          
          // Otherwise sort by due date (oldest first)
          return a.nextReviewDue - b.nextReviewDue;
        })
        .slice(0, Number(limit));

      console.log(`Returning ${dueCards.length} due cards from deck ${deckId}`);
      
      res.json({
        message: "Due cards retrieved successfully",
        data: {
          dueCards,
          totalDue: dueCards.length,
        },
      });
      return;
    }

    // Get user's decks when no specific deck is requested
    console.log('Fetching all decks for user');
    
    const decks = courseId
      ? await MemoryCardDeck.scan("userId")
          .eq(userId)
          .and()
          .where("courseId")
          .eq(courseId as string)
          .exec()
      : await MemoryCardDeck.scan("userId").eq(userId).exec();

    if (!decks || decks.length === 0) {
      console.log(`No decks found for user ${userId}`);
      res.json({
        message: "No decks found",
        data: { dueCards: [], totalDue: 0 },
      });
      return;
    }

    console.log(`Found ${decks.length} decks for user ${userId}`);
    
    // Collect all due cards
    const now = Date.now();
    let allDueCards: (MemoryCard & { deckId: string; deckTitle: string; courseId: string })[] = [];

    decks.forEach((deck, index) => {
      const deckModel = deck as unknown as MemoryCardDeckModel;
      
      // Check if cards array exists and is valid
      if (!deckModel.cards) {
        console.log(`Deck ${deckModel.deckId} has no cards array`);
        deckModel.cards = [];
      } else if (!Array.isArray(deckModel.cards)) {
        console.error(`Deck ${deckModel.deckId} has invalid cards property: ${typeof deckModel.cards}`);
        deckModel.cards = [];
      }
      
      console.log(`Deck ${index + 1}/${decks.length} (${deckModel.deckId}): ${deckModel.cards.length} total cards`);
      
      const dueCards = (deckModel.cards || []).filter(
        (card: MemoryCard) => !card.nextReviewDue || card.nextReviewDue <= now
      );
      
      console.log(`Deck ${deckModel.deckId} has ${dueCards.length} due cards`);
      
      allDueCards = [
        ...allDueCards,
        ...dueCards.map((card: MemoryCard) => ({
          ...card,
          deckId: deckModel.deckId,
          deckTitle: deckModel.title,
          courseId: deckModel.courseId,
        })),
      ];
    });

    console.log(`Found a total of ${allDueCards.length} due cards across all decks`);
    
    // Sort by urgency (overdue first)
    allDueCards.sort((a, b) => {
      // If nextReviewDue is null, treat it as highest priority
      if (!a.nextReviewDue) return -1;
      if (!b.nextReviewDue) return 1;
      
      // Otherwise sort by due date (oldest first)
      return a.nextReviewDue - b.nextReviewDue;
    });

    // Limit the number of cards
    const limitedCards = allDueCards.slice(0, Number(limit));
    
    console.log(`Returning ${limitedCards.length} due cards (limited from ${allDueCards.length} total due cards)`);

    // Ensure each card has an ID to prevent issues with review
    const validatedCards = limitedCards.map(card => {
      if (!card.cardId) {
        console.warn(`Found card without ID, generating one: ${JSON.stringify(card)}`);
        return { ...card, cardId: uuidv4() };
      }
      return card;
    });

    res.json({
      message: "Due cards retrieved successfully",
      data: {
        dueCards: validatedCards,
        totalDue: allDueCards.length,
      },
    });
  } catch (error) {
    console.error("Error retrieving due cards:", error);
    res.status(500).json({ message: "Error retrieving due cards", error });
  }
};

// Submit review for a card
export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deckId, userId, cardId } = req.params;
    const { difficultyRating, isCorrect, thinkingTime, confidence } = req.body;

    // Enhanced validation
    if (!difficultyRating || difficultyRating < 1 || difficultyRating > 5) {
      res.status(400).json({ message: "Difficulty rating must be between 1 and 5" });
      return;
    }

    if (!deckId || !userId || !cardId) {
      res.status(400).json({ message: "Missing required parameters: deckId, userId, or cardId" });
      return;
    }

    // Verify user is reviewing their own card
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized card review" });
      return;
    }

    console.log(`Processing review: userId=${userId}, deckId=${deckId}, cardId=${cardId}, rating=${difficultyRating}`);

    // Get the deck with error handling
    const deck = await MemoryCardDeck.get({
      deckId,
      userId,
    }) as unknown as MemoryCardDeckModel | null;

    if (!deck) {
      console.error(`Deck not found: deckId=${deckId}, userId=${userId}`);
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    // Find the card with better error handling
    const cards = deck.cards || [];
    const cardIndex = cards.findIndex((c: { cardId: string }) => c.cardId === cardId);

    if (cardIndex === -1) {
      console.error(`Card not found: cardId=${cardId} in deck ${deckId}`);
      res.status(404).json({ message: "Card not found in deck" });
      return;
    }

    // Update card stats with comprehensive tracking
    const card = cards[cardIndex];
    const now = Date.now();
    
    card.lastReviewed = now;
    card.repetitionCount = (card.repetitionCount || 0) + 1;
    
    // Enhanced correctness tracking based on rating
    const cardIsCorrect = isCorrect !== undefined ? isCorrect : difficultyRating >= 3;
    
    if (cardIsCorrect) {
      card.correctCount = (card.correctCount || 0) + 1;
    } else {
      card.incorrectCount = (card.incorrectCount || 0) + 1;
    }

    // Store thinking time if provided
    if (thinkingTime) {
      card.averageThinkingTime = card.averageThinkingTime 
        ? Math.round((card.averageThinkingTime + thinkingTime) / 2)
        : thinkingTime;
    }

    // Store confidence level if provided
    if (confidence) {
      card.lastConfidence = confidence;
    }

    // Calculate next review date using enhanced algorithm
    let nextReviewInterval = calculateNextReview(
      difficultyRating,
      card.repetitionCount,
      deck.intervalModifier,
      deck.easyBonus
    );

    // Apply minimum and maximum intervals for data safety
    const minInterval = 10 * 60 * 1000; // 10 minutes minimum
    const maxInterval = 365 * 24 * 60 * 60 * 1000; // 1 year maximum
    
    if (nextReviewInterval < now + minInterval) {
      nextReviewInterval = now + minInterval;
    } else if (nextReviewInterval > now + maxInterval) {
      nextReviewInterval = now + maxInterval;
    }

    card.nextReviewDue = nextReviewInterval;

    // Update difficulty level based on performance
    if (cardIsCorrect && difficultyRating <= 2) {
      // If user found it easy, decrease difficulty
      card.difficultyLevel = Math.max(1, (card.difficultyLevel || 3) - 1);
    } else if (!cardIsCorrect || difficultyRating >= 4) {
      // If user struggled, increase difficulty
      card.difficultyLevel = Math.min(5, (card.difficultyLevel || 3) + 1);
    }

    // Update deck stats with validation
    const totalReviews = Math.max(0, (deck.totalReviews || 0) + 1);
    const correctReviews = cardIsCorrect 
      ? Math.max(0, (deck.correctReviews || 0) + 1)
      : Math.max(0, (deck.correctReviews || 0));

    // Ensure data consistency
    if (correctReviews > totalReviews) {
      console.warn(`Data inconsistency detected: correctReviews (${correctReviews}) > totalReviews (${totalReviews})`);
    }

    // Save changes with comprehensive error handling
    try {
      // Create backup before updating
      createDataBackup(deck, 'submitReview');
      
      // Validate data integrity before saving
      const deckErrors = validateDeckData(deck);
      if (deckErrors.length > 0) {
        console.error(`Data validation failed for deck ${deckId}:`, deckErrors);
        res.status(400).json({ 
          message: "Data validation failed", 
          errors: deckErrors.slice(0, 5), // Limit error count
          details: "Please contact support if this issue persists"
        });
        return;
      }

    await MemoryCardDeck.update(
      {
        deckId,
        userId,
      },
      {
        cards,
        totalReviews,
        correctReviews,
          updatedAt: now,
        }
      );

      console.log(`Review saved successfully: cardId=${cardId}, nextReview=${new Date(card.nextReviewDue).toISOString()}`);

      // Verify the data was saved correctly
      const verificationDeck = await MemoryCardDeck.get({ deckId, userId }) as unknown as MemoryCardDeckModel | null;
      if (!verificationDeck) {
        throw new Error("Failed to verify data after save");
      }

      const verifiedCard = verificationDeck.cards?.find((c: MemoryCard) => c.cardId === cardId);
      if (!verifiedCard || verifiedCard.lastReviewed !== card.lastReviewed) {
        console.warn(`Data verification failed for cardId=${cardId}`);
      }

    res.json({
      message: "Review submitted successfully",
      data: {
        nextReview: new Date(card.nextReviewDue).toISOString(),
          nextReviewDue: card.nextReviewDue,
          repetitionCount: card.repetitionCount,
          difficultyLevel: card.difficultyLevel,
          accuracy: card.correctCount > 0 ? Math.round((card.correctCount / (card.correctCount + card.incorrectCount)) * 100) : 0,
          card: {
            cardId: card.cardId,
            lastReviewed: card.lastReviewed,
            nextReviewDue: card.nextReviewDue,
            repetitionCount: card.repetitionCount,
            correctCount: card.correctCount,
            incorrectCount: card.incorrectCount,
            difficultyLevel: card.difficultyLevel,
          },
      },
    });
    } catch (updateError) {
      console.error("Error updating deck in database:", updateError);
      res.status(500).json({ 
        message: "Failed to save review data", 
        error: "Database update failed",
        details: process.env.NODE_ENV === 'development' ? updateError : undefined
      });
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ 
      message: "Error submitting review", 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Auto-generate cards from course content
export const generateCardsFromCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId } = req.body;
    const { deckTitle, deckDescription } = req.body;

    // Verify user is generating cards for themselves
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized generation of cards" });
      return;
    }

    // Get course data
    const course = await Course.get(courseId) as unknown as CourseModel | null;
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Verify user is enrolled in the course
    const isEnrolled = course.enrollments?.some(
      (enrollment: Enrollment) => enrollment.userId === userId
    );

    if (!isEnrolled) {
      res.status(403).json({ message: "User is not enrolled in this course" });
      return;
    }

    // Get user's progress to only generate cards for completed chapters
    const userProgress = await UserCourseProgress.get({
      userId,
      courseId,
    }) as unknown as UserCourseProgressModel | null;

    if (!userProgress) {
      res.status(404).json({ message: "User progress not found for this course" });
      return;
    }

    // Create a new deck
    const deckId = uuidv4();
    const newDeck = new MemoryCardDeck({
      deckId,
      userId,
      courseId,
      title: deckTitle || `${course.title} Flashcards`,
      description: deckDescription || `Auto-generated flashcards for ${course.title}`,
      cards: [],
      intervalModifier: 1.0,
      easyBonus: 1.3,
      totalReviews: 0,
      correctReviews: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Generate cards based on course content
    const generatedCards: MemoryCard[] = [];
    const contentForAIGeneration: {sectionId: string, chapterId: string, title: string, content: string}[] = [];

    // Loop through sections and chapters
    (course.sections || []).forEach((section: CourseSection) => {
      // Get completed chapters for this section
      const userProgressSection = (userProgress.sections || [])
        .find((s: UserProgressSection) => s.sectionId === section.sectionId);
        
      const completedChapterIds = userProgressSection?.chapters
        .filter((c) => c.completed)
        .map((c) => c.chapterId) || [];

      // Process each completed chapter and collect content for AI generation
      (section.chapters || [])
        .filter((chapter) => completedChapterIds.includes(chapter.chapterId))
        .forEach((chapter) => {
          if (chapter.type === "Text" || chapter.type === "Quiz") {
            // Collect content for AI processing
            contentForAIGeneration.push({
              sectionId: section.sectionId,
              chapterId: chapter.chapterId,
              title: chapter.title,
              content: chapter.content || ""
            });
            
            // Simple algorithm to extract potential Q&A pairs (as fallback)
            const content = chapter.content || "";
            
            // Extract sentences ending with question marks
            const questions = content.match(/[^.!?]+\?/g) || [];
            
            // For each question, find the next sentence as a potential answer
            questions.forEach((question) => {
              const questionIndex = content.indexOf(question);
              if (questionIndex >= 0) {
                const afterQuestion = content.substring(questionIndex + question.length).trim();
                const nextSentenceMatch = afterQuestion.match(/[^.!?]+[.!?]/);
                
                if (nextSentenceMatch && nextSentenceMatch[0]) {
                  const answer = nextSentenceMatch[0].trim();
                  
                  generatedCards.push({
                    cardId: uuidv4(),
                    question: question.trim(),
                    answer: answer,
                    chapterId: chapter.chapterId,
                    sectionId: section.sectionId,
                    difficultyLevel: 3,
                    lastReviewed: Date.now(),
                    nextReviewDue: Date.now() + 24 * 60 * 60 * 1000,
                    repetitionCount: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                  });
                }
              }
            });
            
            // Also look for key terms and definitions
            const definitions = content.match(/[^.!?]+ is [^.!?]+[.!?]/g) || [];
            
            definitions.forEach((def) => {
              const parts = def.split(" is ");
              if (parts.length === 2) {
                generatedCards.push({
                  cardId: uuidv4(),
                  question: `What is ${parts[0].trim()}?`,
                  answer: parts[1].trim(),
                  chapterId: chapter.chapterId,
                  sectionId: section.sectionId,
                  difficultyLevel: 3,
                  lastReviewed: Date.now(),
                  nextReviewDue: Date.now() + 24 * 60 * 60 * 1000,
                  repetitionCount: 0,
                  correctCount: 0,
                  incorrectCount: 0,
                });
              }
            });
          }
        });
    });

    // Use DeepSeek AI Content Analyzer to generate cards from collected content
    if (contentForAIGeneration.length > 0) {
      try {
        // Initialize the AI Content Analyzer
        const aiAnalyzer = new AIContentAnalyzer();
        
        console.log(`Processing ${contentForAIGeneration.length} content pieces with AI analyzer...`);
        
        // For each content piece, generate cards using the AI analyzer
        for (const content of contentForAIGeneration) {
          // Skip if content is too short
          if (content.content.length < 100) {
            console.log(`Skipping short content: ${content.title} (${content.content.length} chars)`);
            continue;
          }
          
          try {
            console.log(`Analyzing content: ${content.title} (${content.content.length} chars)`);
            
            // Generate cards using the AI analyzer
            const aiCards = await aiAnalyzer.generateCardsFromContent(
              content.content, 
              content.title, 
              5 // Generate up to 5 cards per content piece
            );
            
            // Convert AI cards to the memory card format
            aiCards.forEach((card) => {
                generatedCards.push({
                  cardId: uuidv4(),
                  question: card.question,
                  answer: card.answer,
                  chapterId: content.chapterId,
                  sectionId: content.sectionId,
                difficultyLevel: card.difficulty,
                  lastReviewed: Date.now(),
                  nextReviewDue: Date.now() + 24 * 60 * 60 * 1000,
                  repetitionCount: 0,
                  correctCount: 0,
                  incorrectCount: 0,
                  aiGenerated: true,
                });
            });
            
            console.log(`Generated ${aiCards.length} AI cards from: ${content.title}`);
            
            // Add a small delay between AI calls to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1500));
            
          } catch (contentError: any) {
            console.error(`Error processing content "${content.title}":`, contentError.message);
            // Continue with other content pieces if one fails
          }
        }
        
        console.log(`Total AI cards generated: ${generatedCards.filter(c => c.aiGenerated).length}`);
        
      } catch (aiSetupError: any) {
        console.error('Error setting up AI Content Analyzer:', aiSetupError.message);
        // Continue with the basic cards if AI generation fails
      }
    }

    // Limit to a reasonable number of cards but prioritize AI-generated cards
    const limitedCards = generatedCards.slice(0, 100);
    
    // Save the deck with generated cards
    newDeck.cards = limitedCards;
    await newDeck.save();

    res.status(201).json({
      message: "AI cards generated successfully with DeepSeek",
      data: {
        deck: newDeck,
        cardsGenerated: limitedCards.length,
        totalPotentialCards: generatedCards.length,
      },
    });
  } catch (error) {
    console.error("Error generating cards from course:", error);
    res.status(500).json({ message: "Error generating cards from course", error });
  }
};

// Add a batch card creation endpoint to help improve efficiency when users create multiple cards
export const addCardsBatch = async (req: Request, res: Response) => {
  try {
    const { userId, deckId } = req.params;
    const { cards } = req.body;
    
    // Validate required fields
    if (!userId || !deckId || !cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ 
        error: "User ID, deck ID, and a non-empty array of cards are required",
        details: {
          userId: !userId ? "missing" : "provided",
          deckId: !deckId ? "missing" : "provided",
          cards: !cards ? "missing" : !Array.isArray(cards) ? "not an array" : cards.length === 0 ? "empty array" : "valid"
        }
      });
    }
    
    // Get the deck
    const deck = await MemoryCardDeck.get({ deckId, userId });
    
    if (!deck) {
      return res.status(404).json({ error: "Deck not found" });
    }
    
    // Validate each card has required fields
    const invalidCards = cards.filter(card => !card.question || !card.answer);
    
    if (invalidCards.length > 0) {
      return res.status(400).json({ 
        error: "All cards must have a question and answer",
        invalidCards
      });
    }
    
    // Add each card
    const newCards = cards.map(card => ({
      cardId: uuidv4(),
      question: card.question,
      answer: card.answer,
      chapterId: card.chapterId || "default",
      sectionId: card.sectionId || "default",
      difficultyLevel: card.difficultyLevel || 3,
      lastReviewed: Date.now(),
      nextReviewDue: Date.now() + 24 * 60 * 60 * 1000,
      repetitionCount: 0,
      correctCount: 0,
      incorrectCount: 0,
    }));
    
    // Add all new cards to the deck
    deck.cards = [...deck.cards, ...newCards];
    deck.updatedAt = Date.now();
    
    await deck.save();
    
    return res.status(201).json({
      deck,
      cardsAdded: newCards.length
    });
  } catch (error) {
    console.error("Error adding cards batch to deck:", error);
    return res.status(500).json({ error: "Failed to add cards to deck" });
  }
};

// Submits a card review (implements spaced repetition algorithm)
export const submitCardReview = async (req: Request, res: Response) => {
  try {
    const { userId, deckId, cardId } = req.params;
    const { difficultyRating, isCorrect } = req.body;
    
    // Validate required fields
    if (!userId || !deckId || !cardId || difficultyRating === undefined || isCorrect === undefined) {
      return res.status(400).json({ error: "User ID, deck ID, card ID, difficultyRating, and isCorrect are required" });
    }
    
    // Get the deck
    const deck = await MemoryCardDeck.get({ deckId, userId });
    
    if (!deck) {
      return res.status(404).json({ error: "Deck not found" });
    }
    
    // Find the card
    const cardIndex = deck.cards.findIndex((c: { cardId: string }) => c.cardId === cardId);
    
    if (cardIndex === -1) {
      return res.status(404).json({ error: "Card not found" });
    }
    
    const card = deck.cards[cardIndex];
    
    // Update card review statistics
    card.repetitionCount += 1;
    if (isCorrect) {
      card.correctCount += 1;
      deck.correctReviews += 1;
    } else {
      card.incorrectCount += 1;
    }
    
    deck.totalReviews += 1;
    
    // Set lastReviewed to current time
    card.lastReviewed = Date.now();
    
    // Calculate next review time based on spaced repetition algorithm (SM-2)
    let nextReviewInterval: number;
    
    if (difficultyRating === 1) {
      // Easy - Longer interval
      nextReviewInterval = (card.repetitionCount === 1) ? 1 : (card.repetitionCount * 2 * deck.easyBonus); // days
    } else if (difficultyRating === 2) {
      // Good - Standard interval
      nextReviewInterval = (card.repetitionCount === 1) ? 1 : card.repetitionCount; // days
    } else if (difficultyRating === 3) {
      // Hard - Shorter interval
      nextReviewInterval = (card.repetitionCount === 1) ? 0.5 : (card.repetitionCount * 0.5); // days
    } else {
      // Again - Very short interval
      nextReviewInterval = 0.0069; // About 10 minutes in days (0.0069 days ≈ 10 minutes)
      // Reset repetition count for "Again" ratings
      card.repetitionCount = 0;
    }
    
    // Apply interval modifier
    nextReviewInterval *= deck.intervalModifier;
    
    // Convert interval to milliseconds
    const nextReviewMs = nextReviewInterval * 24 * 60 * 60 * 1000;
    
    // Set next review due date
    card.nextReviewDue = Date.now() + nextReviewMs;
    
    deck.updatedAt = Date.now();
    
    await deck.save();
    
    return res.status(200).json({
      success: true,
      nextReview: card.nextReviewDue,
    });
  } catch (error) {
    console.error("Error submitting card review:", error);
    return res.status(500).json({ error: "Failed to submit card review" });
  }
};

// Generate AI alternatives for a given card using Deepseek API
export const generateAIAlternatives = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { question, answer, count = 3 } = req.body;

    // Verify user is requesting for themselves
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized access to AI card generation" });
      return;
    }

    if (!question || !answer) {
      res.status(400).json({ message: "Question and answer are required" });
      return;
    }

    // Validate count parameter
    const requestedCount = Math.min(Math.max(parseInt(count) || 3, 1), 10); // Limit between 1-10

    console.log(`Generating ${requestedCount} AI alternatives for question: "${question.substring(0, 50)}..."`);

    // Use the new AI Content Analyzer
    const aiAnalyzer = new AIContentAnalyzer();
    
    try {
      const alternatives = await aiAnalyzer.generateAlternativeCards(question, answer, requestedCount);
      
      // Convert to the expected format
      const formattedAlternatives = alternatives.map(card => ({
        question: card.question,
        answer: card.answer
      }));

      console.log(`Successfully generated ${formattedAlternatives.length} AI alternatives using AIContentAnalyzer`);

      // Success response
      res.json({
        message: "AI alternatives generated successfully",
        data: {
          alternatives: formattedAlternatives,
          originalQuestion: question,
          originalAnswer: answer,
          count: formattedAlternatives.length,
          generatedBy: 'deepseek-chat-v2',
          metadata: {
            difficulties: alternatives.map(a => a.difficulty),
            types: alternatives.map(a => a.type)
          }
        },
      });

    } catch (aiError: any) {
      console.error('AI Content Analyzer error:', aiError);
      
      // Check if it's a rate limit or quota error
      const isRateLimit = aiError.response?.status === 429;
      const isQuotaError = aiError.response?.status === 402;
      const isAuthError = aiError.response?.status === 401;

      if (isRateLimit) {
        res.status(429).json({ 
          message: "AI service is temporarily busy. Please try again in a few moments.",
          error: "Rate limit exceeded"
        });
        return;
      }

      if (isQuotaError) {
        res.status(402).json({ 
          message: "AI service quota exceeded. Please contact support.",
          error: "Quota exceeded"
        });
        return;
      }

      if (isAuthError) {
        res.status(500).json({ 
          message: "AI service configuration error. Please contact support.",
          error: "Authentication failed"
        });
        return;
      }

      // Fallback to enhanced mock generation for other errors
      console.log('Falling back to enhanced mock generation...');
      
      const fallbackAlternatives = generateEnhancedMockAlternatives(question, answer, requestedCount);
    
    res.json({
        message: "AI alternatives generated successfully (fallback mode)",
      data: {
          alternatives: fallbackAlternatives,
        originalQuestion: question,
        originalAnswer: answer,
          count: fallbackAlternatives.length,
          generatedBy: 'fallback-enhanced-v2'
      },
    });
    }

  } catch (error: any) {
    console.error("Error generating AI alternatives:", error);
    res.status(500).json({ 
      message: "Error generating AI alternatives", 
      error: error.message || 'Unknown error'
    });
  }
};

// Enhanced fallback function for when Deepseek API is unavailable
function generateEnhancedMockAlternatives(originalQuestion: string, originalAnswer: string, count: number) {
  const alternatives = [];
  
  // Improved question transformation patterns
  const questionPatterns = [
    // Different question formats
    {
      pattern: (q: string) => `Explain the concept behind: ${q.replace(/^(what|how|why|when|where|which)/i, '').trim()}`,
      answerPattern: (a: string) => `This concept refers to ${a.toLowerCase()}. Understanding this helps in grasping the broader context.`
    },
    {
      pattern: (q: string) => `In simple terms, ${q.toLowerCase().replace('?', '')}?`,
      answerPattern: (a: string) => `Simply put, ${a}.`
    },
    {
      pattern: (q: string) => `How would you describe ${q.replace(/^(what|how) is |^(what|how) are /i, '').replace('?', '')} to a beginner?`,
      answerPattern: (a: string) => `For beginners: ${a}. This fundamental concept is important because it forms the basis for more advanced topics.`
    },
    {
      pattern: (q: string) => `What is the significance of ${q.replace(/^(what|how) is |^(what|how) are /i, '').replace('?', '')}?`,
      answerPattern: (a: string) => `The significance lies in the fact that ${a.toLowerCase()}. This plays a crucial role in the overall understanding.`
    },
    {
      pattern: (q: string) => `Compare and contrast: ${q.replace('?', '').replace(/^(what|how) is /i, '')}`,
      answerPattern: (a: string) => `When comparing this concept: ${a}. The key differences and similarities help in better comprehension.`
    },
    {
      pattern: (q: string) => `Give an example of ${q.replace(/^(what|how) is |^(what|how) are /i, '').replace('?', '')}`,
      answerPattern: (a: string) => `An example would be: ${a}. This illustrates the practical application of the concept.`
    }
  ];

  // Generate alternatives using patterns
  for (let i = 0; i < Math.min(count, questionPatterns.length); i++) {
    const pattern = questionPatterns[i];
    try {
      const altQuestion = pattern.pattern(originalQuestion);
      const altAnswer = pattern.answerPattern(originalAnswer);
      
      if (altQuestion && altAnswer && altQuestion !== originalQuestion) {
        alternatives.push({
          question: altQuestion,
          answer: altAnswer
        });
      }
    } catch (err) {
      console.warn('Error applying pattern:', err);
    }
  }

  // If we need more alternatives, add some generic but useful ones
  while (alternatives.length < count) {
    const remaining = count - alternatives.length;
    const genericPatterns = [
      {
        question: `What are the key points about ${originalQuestion.replace('?', '').replace(/^(what|how) is /i, '')}?`,
        answer: `The key points include: ${originalAnswer}. These points are essential for understanding.`
      },
      {
        question: `Why is understanding ${originalQuestion.replace('?', '').replace(/^(what|how) is /i, '')} important?`,
        answer: `Understanding this is important because ${originalAnswer.toLowerCase()}. This knowledge is valuable for further learning.`
      }
    ];

    if (remaining > 0 && genericPatterns[0]) {
      alternatives.push(genericPatterns[0]);
    }
    if (remaining > 1 && genericPatterns[1]) {
      alternatives.push(genericPatterns[1]);
    }
    
    break; // Prevent infinite loop
  }

  return alternatives.slice(0, count);
}

// Debug endpoint to check deck status
export const debugDeckStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, deckId } = req.params;
    
    console.log(`Debug request for deckId=${deckId}, userId=${userId}`);
    
    // Check auth
    if ((req as any).user?.id !== userId && (req as any).user?.role !== "admin") {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    
    const results: any = {
      requestedDeckId: deckId,
      requestedUserId: userId,
      authUserId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
    };
    
    // Try to get the specific deck
    try {
      const specificDeck = await MemoryCardDeck.get({
        deckId,
        userId,
      });
      
      results.specificDeckFound = !!specificDeck;
      if (specificDeck) {
        results.specificDeck = {
          deckId: specificDeck.deckId,
          userId: specificDeck.userId,
          title: specificDeck.title,
          cardCount: specificDeck.cards?.length || 0,
          createdAt: new Date(specificDeck.createdAt).toISOString(),
        };
      }
    } catch (error) {
      results.specificDeckError = error;
    }
    
    // Get all decks for this user
    try {
      const userDecks = await MemoryCardDeck.scan("userId").eq(userId).exec();
      results.userDeckCount = userDecks.length;
      results.userDecks = userDecks.map(deck => ({
        deckId: deck.deckId,
        title: deck.title,
        cardCount: deck.cards?.length || 0,
        createdAt: new Date(deck.createdAt).toISOString(),
      }));
    } catch (error) {
      results.userDecksError = error;
    }
    
    // Try to find any deck with this deckId regardless of userId
    try {
      const anyDecksWithId = await MemoryCardDeck.scan("deckId").eq(deckId).exec();
      results.allDecksWithThisId = anyDecksWithId.map(deck => ({
        deckId: deck.deckId,
        userId: deck.userId,
        title: deck.title,
        cardCount: deck.cards?.length || 0,
      }));
    } catch (error) {
      results.scanError = error;
    }
    
    res.json(results);
    
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: "Debug endpoint failed", details: error });
  }
};

 
 
 
 