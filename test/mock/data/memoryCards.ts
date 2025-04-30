import { faker } from '@faker-js/faker';
import { MOCK_USERS } from './users';
import { MOCK_COURSES } from './courses';

// Generate a mock memory card
export const generateMockMemoryCard = (deckId?: string, deckTitle?: string, courseId?: string) => {
  return {
    cardId: faker.string.uuid(),
    question: faker.lorem.sentence().replace(/\.$/, '?'),
    answer: faker.lorem.paragraph(),
    chapterId: faker.string.uuid(),
    sectionId: faker.string.uuid(),
    difficultyLevel: faker.number.int({ min: 1, max: 5 }),
    lastReviewed: faker.date.recent().getTime(),
    nextReviewDue: faker.date.future().getTime(),
    repetitionCount: faker.number.int({ min: 0, max: 20 }),
    correctCount: faker.number.int({ min: 0, max: 15 }),
    incorrectCount: faker.number.int({ min: 0, max: 5 }),
    deckId: deckId || undefined,
    deckTitle: deckTitle || undefined,
    courseId: courseId || undefined,
  };
};

// Generate a mock memory card deck
export const generateMockMemoryCardDeck = (userId = MOCK_USERS.STUDENT.id, courseId = MOCK_COURSES.PUBLISHED.courseId) => {
  const deckId = faker.string.uuid();
  const title = faker.lorem.words({ min: 3, max: 6 });
  
  return {
    deckId,
    userId,
    courseId,
    title,
    description: faker.lorem.sentence(),
    cards: Array.from(
      { length: faker.number.int({ min: 5, max: 20 }) }, 
      () => generateMockMemoryCard(deckId, title, courseId)
    ),
    intervalModifier: 1.0,
    easyBonus: 1.3,
    totalReviews: faker.number.int({ min: 0, max: 100 }),
    correctReviews: faker.number.int({ min: 0, max: 80 }),
    createdAt: faker.date.past().getTime(),
    updatedAt: faker.date.recent().getTime(),
  };
};

// Generate multiple memory card decks
export const generateMockMemoryCardDecks = (count = 3, userId = MOCK_USERS.STUDENT.id) => {
  return Array.from({ length: count }, () => generateMockMemoryCardDeck(userId));
};

// Generate mock AI alternatives for a memory card
export const generateMockAIAlternatives = (originalQuestion: string, originalAnswer: string, count = 3) => {
  return {
    originalQuestion,
    originalAnswer,
    alternatives: Array.from({ length: count }, () => ({
      question: faker.lorem.sentence().replace(/\.$/, '?'),
      answer: faker.lorem.paragraph(),
    })),
  };
};

// Generate mock card review data
export const generateMockCardReview = (
  cardId: string, 
  userId = MOCK_USERS.STUDENT.id, 
  rating: 'again' | 'hard' | 'good' | 'easy' = 'good'
) => {
  return {
    cardId,
    userId,
    rating,
    reviewTime: faker.number.int({ min: 5, max: 60 }),
    sessionDuration: faker.number.int({ min: 60, max: 1800 }),
  };
};

// Create predefined memory card decks for consistent testing
export const MOCK_MEMORY_CARD_DECKS = {
  SMALL: {
    ...generateMockMemoryCardDeck(),
    cards: Array.from({ length: 5 }, () => generateMockMemoryCard()),
  },
  MEDIUM: {
    ...generateMockMemoryCardDeck(),
    cards: Array.from({ length: 10 }, () => generateMockMemoryCard()),
  },
  LARGE: {
    ...generateMockMemoryCardDeck(),
    cards: Array.from({ length: 20 }, () => generateMockMemoryCard()),
  },
};