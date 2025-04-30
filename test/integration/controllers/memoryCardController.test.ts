import { Request, Response } from 'express';
import * as memoryCardController from '@server/controllers/memoryCardController';
import MemoryCardDeck from '@server/models/memoryCardModel';
import { MOCK_USERS } from '../../mock/data/users';
import { generateMockMemoryCardDeck, generateMockMemoryCard } from '../../mock/data/memoryCards';

// Mock MemoryCardDeck model
jest.mock('@server/models/memoryCardModel', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    scan: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    update: jest.fn(),
  },
}));

// Helper to create mock request and response objects
const createMockReqRes = () => {
  const req = {
    params: {},
    query: {},
    body: {},
    auth: {
      userId: MOCK_USERS.STUDENT.id,
    },
    user: {
      id: MOCK_USERS.STUDENT.id,
      role: 'student',
    },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  return { req, res };
};

describe('Memory Card Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDecks', () => {
    test('should return user decks when found', async () => {
      const { req, res } = createMockReqRes();
      req.params.userId = MOCK_USERS.STUDENT.id;
      
      const mockDecks = [generateMockMemoryCardDeck(MOCK_USERS.STUDENT.id)];
      
      (MemoryCardDeck.scan().eq().exec as jest.Mock).mockResolvedValueOnce(mockDecks);

      await memoryCardController.getUserDecks(req, res);

      expect(MemoryCardDeck.scan).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Decks retrieved successfully',
        data: mockDecks,
      });
    });

    test('should handle errors', async () => {
      const { req, res } = createMockReqRes();
      req.params.userId = 'invalid-user-id';
      
      const error = new Error('Database error');
      (MemoryCardDeck.scan().eq().exec as jest.Mock).mockRejectedValueOnce(error);

      await memoryCardController.getUserDecks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error retrieving decks',
        error: error,
      });
    });
  });

  describe('createDeck', () => {
    test('should create a new deck', async () => {
      const { req, res } = createMockReqRes();
      
      req.body = {
        userId: MOCK_USERS.STUDENT.id,
        courseId: 'course1',
        title: 'Test Deck',
        description: 'Test description',
      };
      
      // Mock the save method
      const mockDeck = {
        ...req.body,
        deckId: expect.any(String),
        cards: [],
        intervalModifier: 1.0,
        easyBonus: 1.3,
        totalReviews: 0,
        correctReviews: 0,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        save: jest.fn().mockResolvedValueOnce({}),
      };
      
      jest.spyOn(memoryCardController as any, 'createNewDeck').mockResolvedValueOnce(mockDeck);

      await memoryCardController.createDeck(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Deck created successfully',
        data: mockDeck,
      });
    });

    test('should validate required fields', async () => {
      const { req, res } = createMockReqRes();
      
      // Missing required fields
      req.body = {
        userId: MOCK_USERS.STUDENT.id,
        // Missing courseId and title
      };

      await memoryCardController.createDeck(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Missing required fields'),
      });
    });
  });

  describe('getDueCards', () => {
    test('should return due cards for review', async () => {
      const { req, res } = createMockReqRes();
      
      req.params.userId = MOCK_USERS.STUDENT.id;
      req.query.deckId = 'deck1';
      req.query.limit = '10';
      
      const mockDecks = [generateMockMemoryCardDeck(MOCK_USERS.STUDENT.id)];
      (MemoryCardDeck.scan().eq().exec as jest.Mock).mockResolvedValueOnce(mockDecks);
      
      // Mock the current time
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValueOnce(now);
      
      // Ensure some cards are due
      mockDecks[0].cards.forEach(card => {
        card.nextReviewDue = now - 1000; // Make cards due
      });

      await memoryCardController.getDueCards(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Due cards retrieved successfully',
        data: expect.arrayContaining([expect.objectContaining({ cardId: expect.any(String) })]),
      });
    });

    test('should handle no due cards', async () => {
      const { req, res } = createMockReqRes();
      
      req.params.userId = MOCK_USERS.STUDENT.id;
      
      const mockDecks = [generateMockMemoryCardDeck(MOCK_USERS.STUDENT.id)];
      (MemoryCardDeck.scan().eq().exec as jest.Mock).mockResolvedValueOnce(mockDecks);
      
      // Make all cards not due yet
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValueOnce(now);
      mockDecks[0].cards.forEach(card => {
        card.nextReviewDue = now + 1000000; // Make cards not due
      });

      await memoryCardController.getDueCards(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'No due cards found',
        data: [],
      });
    });
  });

  describe('submitCardReview', () => {
    test('should process a card review and update the card', async () => {
      const { req, res } = createMockReqRes();
      
      const mockDeck = generateMockMemoryCardDeck(MOCK_USERS.STUDENT.id);
      const mockCard = mockDeck.cards[0];
      
      req.body = {
        userId: MOCK_USERS.STUDENT.id,
        cardId: mockCard.cardId,
        deckId: mockDeck.deckId,
        rating: 'good',
        reviewTime: 15, // seconds
        sessionDuration: 300, // seconds
      };
      
      (MemoryCardDeck.get as jest.Mock).mockResolvedValueOnce(mockDeck);
      (MemoryCardDeck.update as jest.Mock).mockResolvedValueOnce({
        ...mockDeck,
        cards: mockDeck.cards.map(c => 
          c.cardId === mockCard.cardId 
            ? { ...c, nextReviewDue: expect.any(Number), repetitionCount: c.repetitionCount + 1 } 
            : c
        ),
      });

      await memoryCardController.submitCardReview(req, res);

      expect(MemoryCardDeck.get).toHaveBeenCalledWith(mockDeck.deckId);
      expect(MemoryCardDeck.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Card review submitted successfully',
        data: expect.objectContaining({
          cardId: mockCard.cardId,
          nextReviewDue: expect.any(Number),
        }),
      });
    });

    test('should validate required fields', async () => {
      const { req, res } = createMockReqRes();
      
      // Missing required fields
      req.body = {
        userId: MOCK_USERS.STUDENT.id,
        // Missing cardId, deckId, rating
      };

      await memoryCardController.submitCardReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Missing required fields'),
      });
    });
  });

  describe('generateAIAlternatives', () => {
    test('should generate alternative questions and answers', async () => {
      const { req, res } = createMockReqRes();
      
      req.body = {
        question: 'What is the capital of France?',
        answer: 'Paris',
      };
      
      // Mock the AI generation function
      const mockAlternatives = [
        { question: 'What city serves as the capital of France?', answer: 'Paris is the capital of France.' },
        { question: 'Which city is the capital of France?', answer: 'The capital of France is Paris.' },
      ];
      
      jest.spyOn(memoryCardController as any, 'generateAlternativesWithAI').mockResolvedValueOnce(mockAlternatives);

      await memoryCardController.generateAIAlternatives(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'AI alternatives generated successfully',
        data: {
          alternatives: mockAlternatives,
          originalQuestion: req.body.question,
          originalAnswer: req.body.answer,
        },
      });
    });

    test('should validate required fields', async () => {
      const { req, res } = createMockReqRes();
      
      // Missing required fields
      req.body = {
        // Missing question and answer
      };

      await memoryCardController.generateAIAlternatives(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Missing required fields'),
      });
    });
  });
});