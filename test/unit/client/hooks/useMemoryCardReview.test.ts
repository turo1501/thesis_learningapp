import { renderHook, act } from '@testing-library/react';
import { useMemoryCardReview } from '@/hooks/useMemoryCardReview';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/state/api';
import React from 'react';

// Mock RTK Query hooks
jest.mock('@/state/api', () => {
  const originalModule = jest.requireActual('@/state/api');
  
  return {
    ...originalModule,
    useGetDueCardsQuery: jest.fn(),
    useSubmitCardReviewMutation: jest.fn().mockReturnValue([
      jest.fn().mockResolvedValue({}),
      { isLoading: false }
    ]),
  };
});

// Sample card data
const mockDueCards = [
  {
    cardId: 'card1',
    question: 'What is the capital of France?',
    answer: 'Paris',
    chapterId: 'chapter1',
    sectionId: 'section1',
    difficultyLevel: 3,
    lastReviewed: Date.now() - 86400000, // 1 day ago
    nextReviewDue: Date.now() - 3600000, // 1 hour ago
    repetitionCount: 2,
    correctCount: 1,
    incorrectCount: 1,
    deckId: 'deck1',
    deckTitle: 'Geography',
    courseId: 'course1',
  },
  {
    cardId: 'card2',
    question: 'What is the capital of Germany?',
    answer: 'Berlin',
    chapterId: 'chapter1',
    sectionId: 'section1',
    difficultyLevel: 2,
    lastReviewed: Date.now() - 172800000, // 2 days ago
    nextReviewDue: Date.now() - 7200000, // 2 hours ago
    repetitionCount: 1,
    correctCount: 1,
    incorrectCount: 0,
    deckId: 'deck1',
    deckTitle: 'Geography',
    courseId: 'course1',
  },
];

// Create a test wrapper with Redux provider
const createWrapper = () => {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useMemoryCardReview', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementation
    const { useGetDueCardsQuery } = require('@/state/api');
    useGetDueCardsQuery.mockReturnValue({
      data: mockDueCards,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  test('should initialize with correct state', () => {
    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.cards).toEqual(mockDueCards);
    expect(result.current.currentCardIndex).toBe(0);
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.sessionStartTime).toBeDefined();
    expect(result.current.sessionDuration).toBe(0);
    expect(result.current.reviewsCompleted).toBe(0);
  });

  test('should handle flipping card', () => {
    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    // Flip the card
    act(() => {
      result.current.flipCard();
    });

    expect(result.current.isFlipped).toBe(true);

    // Flip back
    act(() => {
      result.current.flipCard();
    });

    expect(result.current.isFlipped).toBe(false);
  });

  test('should handle rating cards and advancing to next card', async () => {
    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    // Rate the first card as "good"
    await act(async () => {
      await result.current.rateCard('good');
    });

    // Should advance to next card
    expect(result.current.currentCardIndex).toBe(1);
    expect(result.current.reviewsCompleted).toBe(1);
    expect(result.current.isFlipped).toBe(false);
  });

  test('should calculate review completion status correctly', async () => {
    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    // Rate all cards to complete the review
    for (let i = 0; i < mockDueCards.length; i++) {
      await act(async () => {
        await result.current.rateCard('good');
      });
    }

    // Check if review is complete
    expect(result.current.isComplete).toBe(true);
    expect(result.current.reviewsCompleted).toBe(mockDueCards.length);
    expect(result.current.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.current.accuracy).toBeLessThanOrEqual(100);
  });

  test('should handle session duration tracking', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Session duration should be updated
    expect(result.current.sessionDuration).toBeGreaterThanOrEqual(30);
    
    jest.useRealTimers();
  });

  test('should handle loading state', () => {
    const { useGetDueCardsQuery } = require('@/state/api');
    useGetDueCardsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.cards).toEqual([]);
  });

  test('should handle error state', () => {
    const { useGetDueCardsQuery } = require('@/state/api');
    useGetDueCardsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: { message: 'Server error' } },
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    expect(result.current.isError).toBe(true);
    expect(result.current.errorMessage).toBe('Server error');
  });

  test('should handle no cards scenario', () => {
    const { useGetDueCardsQuery } = require('@/state/api');
    useGetDueCardsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemoryCardReview({
      userId: 'user1',
      deckId: 'deck1',
    }), { wrapper: createWrapper() });

    expect(result.current.hasCards).toBe(false);
    expect(result.current.isComplete).toBe(true);
  });
});