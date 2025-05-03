import { Request, Response } from "express";
import MemoryCardDeck from "../models/memoryCardModel";
import Course from "../models/courseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import { v4 as uuidv4 } from "uuid";

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
      incorrectCount = 0
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

    // Verify user is modifying their own deck
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized deck modification" });
      return;
    }

    // Log parameters for debugging
    console.log(`Adding card to deck: ${deckId} for user: ${userId}`);

    // Get the deck
    const deck = await MemoryCardDeck.get({
      deckId,
      userId,
    }) as unknown as MemoryCardDeckModel | null;

    if (!deck) {
      console.error(`Deck not found: deckId=${deckId}, userId=${userId}`);
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    // Create new card with type validations
    const newCard: MemoryCard = {
      cardId: uuidv4(),
      question,
      answer,
      chapterId: chapterId || 'default',
      sectionId: sectionId || 'default',
      difficultyLevel: difficultyLevel || 3,
      lastReviewed: lastReviewed || Date.now(), // Use provided value or current timestamp
      nextReviewDue: nextReviewDue || (Date.now() + 24 * 60 * 60 * 1000), // Due in 24h by default
      repetitionCount: repetitionCount || 0,
      correctCount: correctCount || 0,
      incorrectCount: incorrectCount || 0,
    };

    // Add card to deck
    const cards = deck.cards || [];
    cards.push(newCard);

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
      message: "Card added successfully",
      data: {
        card: newCard,
        deckId,
        deckTitle: deck.title,
      },
    });
  } catch (error) {
    console.error("Error adding card to deck:", error);
    res.status(500).json({ message: "Error adding card to deck", error });
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
      console.log(`Fetching cards for specific deck: ${deckId}`);
      
      const deck = await MemoryCardDeck.get({
        deckId: deckId as string,
        userId,
      }) as unknown as MemoryCardDeckModel | null;

      if (!deck) {
        console.log(`Deck not found: ${deckId}`);
        res.status(404).json({ message: "Deck not found" });
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
          deckId: deck.deckId,
          deckTitle: deck.title,
          courseId: deck.courseId,
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
    const { difficultyRating, isCorrect } = req.body;

    // Validate input
    if (difficultyRating < 1 || difficultyRating > 4) {
      res.status(400).json({ message: "Difficulty rating must be between 1 and 4" });
      return;
    }

    // Verify user is reviewing their own card
    if ((req as any).user?.id !== userId) {
      res.status(403).json({ message: "Unauthorized card review" });
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

    // Update card stats
    const card = cards[cardIndex];
    card.lastReviewed = Date.now();
    card.repetitionCount = (card.repetitionCount || 0) + 1;
    
    if (isCorrect) {
      card.correctCount = (card.correctCount || 0) + 1;
    } else {
      card.incorrectCount = (card.incorrectCount || 0) + 1;
    }

    // Calculate next review date
    card.nextReviewDue = calculateNextReview(
      difficultyRating,
      card.repetitionCount,
      deck.intervalModifier,
      deck.easyBonus
    );

    // Update deck stats
    const totalReviews = (deck.totalReviews || 0) + 1;
    const correctReviews = isCorrect 
      ? (deck.correctReviews || 0) + 1 
      : (deck.correctReviews || 0);

    // Save changes
    await MemoryCardDeck.update(
      {
        deckId,
        userId,
      },
      {
        cards,
        totalReviews,
        correctReviews,
        updatedAt: Date.now(),
      }
    );

    res.json({
      message: "Review submitted successfully",
      data: {
        nextReview: new Date(card.nextReviewDue).toISOString(),
        card,
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Error submitting review", error });
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

    // Use DeepSeek API to generate cards from collected content if there's enough content
    if (contentForAIGeneration.length > 0) {
      try {
        // We'll use axios which is already imported in the file
        const axios = require('axios');
        
        // For each content piece, generate more sophisticated cards using DeepSeek
        for (const content of contentForAIGeneration) {
          // Skip if content is too short
          if (content.content.length < 50) continue;
          
          const prompt = `You are an expert educator creating flashcards to help students learn. 
Generate 5 high-quality flashcards from the following course content. 
Each flashcard should have a question and answer format that tests key concepts.
Make questions that require understanding, not just memorization.
Format your response as JSON array: [{"question": "...", "answer": "..."}]
Don't include any other text in your response, just the JSON array.

Content title: ${content.title}
Content: ${content.content.substring(0, 3000)}`; // Limit to 3000 chars to avoid token limits

          try {
            const response = await axios.post(
              'https://api.deepseek.com/v1/chat/completions',
              {
                model: 'deepseek-chat',
                messages: [
                  { role: 'system', content: 'You are an educational content AI that creates flashcard questions and answers from course material. Respond with valid JSON only.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                response_format: { type: "json_object" }
              },
              {
                headers: {
                  'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            // Parse the response to get the flashcards
            let aiCards = [];
            try {
              const responseText = response.data.choices[0]?.message?.content || '';
              
              // DeepSeek might wrap JSON in ```json or other formatting - extract just the JSON
              const jsonMatch = responseText.match(/\[[\s\S]*\]/);
              const jsonString = jsonMatch ? jsonMatch[0] : responseText;
              
              aiCards = JSON.parse(jsonString);
            } catch (parseError) {
              console.error('Error parsing AI response:', parseError);
              console.log('Raw response:', response.data.choices[0]?.message?.content);
              aiCards = [];
            }

            // Add the AI-generated cards to our collection
            aiCards.forEach((card: { question?: string, answer?: string }) => {
              if (card.question && card.answer) {
                generatedCards.push({
                  cardId: uuidv4(),
                  question: card.question,
                  answer: card.answer,
                  chapterId: content.chapterId,
                  sectionId: content.sectionId,
                  difficultyLevel: 3,
                  lastReviewed: Date.now(),
                  nextReviewDue: Date.now() + 24 * 60 * 60 * 1000,
                  repetitionCount: 0,
                  correctCount: 0,
                  incorrectCount: 0,
                  aiGenerated: true,
                });
              }
            });
          } catch (aiError) {
            console.error('Error generating AI cards:', aiError);
            // Continue with other content pieces if one fails
          }
        }
      } catch (deepseekError) {
        console.error('Error with DeepSeek API:', deepseekError);
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

// Generate AI alternatives for a given card
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

    // In a real implementation, this would call an AI service like OpenAI
    // For now, we'll simulate it with predefined alternatives
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create variations by adding different perspectives or formats
    const alternatives = [];
    
    // Simple algorithm to generate alternatives by reformatting the question
    const questionFormats = [
      `Explain: ${question}`,
      `Define in your own words: ${question}`,
      `What is meant by "${question}"?`,
      `How would you describe "${question}" to someone new to this topic?`,
    ];
    
    // Answer reformatting patterns
    const answerFormats = [
      answer,
      `Simply put, ${answer.toLowerCase()}`,
      `In technical terms, ${answer}`,
      `The most accurate description would be: ${answer}`,
    ];
    
    // Generate count number of alternatives
    for (let i = 0; i < Math.min(count, questionFormats.length); i++) {
      alternatives.push({
        question: questionFormats[i],
        answer: answerFormats[i],
      });
    }
    
    res.json({
      message: "AI alternatives generated successfully",
      data: {
        alternatives,
        originalQuestion: question,
        originalAnswer: answer,
      },
    });
  } catch (error) {
    console.error("Error generating AI alternatives:", error);
    res.status(500).json({ message: "Error generating AI alternatives", error });
  }
}; 
 
 
 