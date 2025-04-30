import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

// Define performance metrics
const deckCreationDuration = new Trend('memory_cards_deck_creation_duration');
const cardAdditionDuration = new Trend('memory_cards_card_addition_duration');
const dueCardsFetchDuration = new Trend('memory_cards_due_cards_fetch_duration');
const cardReviewDuration = new Trend('memory_cards_review_duration');
const aiAlternativesGenDuration = new Trend('memory_cards_ai_alternatives_duration');

const errors = new Counter('errors');
const errorRate = new Rate('error_rate');

// Configuration
export const options = {
  scenarios: {
    average_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users over 30 seconds
        { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
        { duration: '20s', target: 0 },   // Ramp down to 0 over 20 seconds
      ],
      gracefulRampDown: '10s',
    },
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },  // Quickly ramp up to 20 users
        { duration: '1m', target: 30 },   // Increase to 30 users over 1 minute
        { duration: '1m', target: 50 },   // Increase to 50 users over 1 minute
        { duration: '30s', target: 0 },   // Ramp down to 0
      ],
      gracefulRampDown: '10s',
    },
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },   // Baseline load
        { duration: '10s', target: 100 }, // Spike to 100 users
        { duration: '30s', target: 5 },   // Back to baseline
        { duration: '10s', target: 0 },   // Ramp down to 0
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'memory_cards_deck_creation_duration': ['avg<500', 'p(95)<1000'],
    'memory_cards_card_addition_duration': ['avg<300', 'p(95)<800'],
    'memory_cards_due_cards_fetch_duration': ['avg<200', 'p(95)<500'],
    'memory_cards_review_duration': ['avg<300', 'p(95)<700'],
    'memory_cards_ai_alternatives_duration': ['avg<2000', 'p(95)<3000'],
    'error_rate': ['rate<0.1'], // Error rate < 10%
    'http_req_duration': ['p(95)<1500'], // 95% of requests should be below 1.5s
  },
};

// Test users and authentication
const users = new SharedArray('users', function() {
  return [
    {
      id: 'test-student-id',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXN0dWRlbnQtaWQiLCJyb2xlIjoic3R1ZGVudCJ9.example',
    },
    {
      id: 'test-teacher-id',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXRlYWNoZXItaWQiLCJyb2xlIjoidGVhY2hlciJ9.example',
    },
  ];
});

// Test data generation
function generateTestDeck(userId, courseId) {
  return {
    userId,
    courseId,
    title: `Performance Test Deck ${randomString(6)}`,
    description: `This is a test deck created for performance testing ${randomString(10)}`,
  };
}

function generateTestCard() {
  const topics = ['History', 'Geography', 'Science', 'Math', 'Literature'];
  const topic = topics[randomIntBetween(0, topics.length - 1)];
  
  const questionTemplates = [
    `What is the capital of ${randomString(8)}?`,
    `Who discovered ${randomString(8)}?`,
    `When did ${randomString(8)} happen?`,
    `Define ${randomString(8)}:`,
    `Explain the process of ${randomString(8)}:`,
  ];
  
  return {
    question: questionTemplates[randomIntBetween(0, questionTemplates.length - 1)],
    answer: `This is the answer for ${randomString(15)}`,
    chapterId: `chapter-${randomString(6)}`,
    sectionId: `section-${randomString(6)}`,
    difficultyLevel: randomIntBetween(1, 5),
  };
}

export default function() {
  const user = users[randomIntBetween(0, users.length - 1)];
  const baseUrl = __ENV.API_BASE_URL || 'http://localhost:8001';
  const courseId = 'course-' + randomString(8);
  let deckId, cardIds = [];
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  };
  
  // Helper function to handle responses
  function handleResponse(res, metricTrend, operationName) {
    const success = check(res, {
      [`${operationName} status is 200 OK`]: (r) => r.status === 200,
      [`${operationName} response has data`]: (r) => r.json().data !== undefined,
    });
    
    if (!success) {
      errors.add(1);
      errorRate.add(1);
      console.log(`Error in ${operationName}:`, res.status, res.body);
    } else {
      errorRate.add(0);
    }
    
    metricTrend.add(res.timings.duration);
    return res.json();
  }
  
  // 1. Create a memory card deck
  group('Create Memory Card Deck', function() {
    const deck = generateTestDeck(user.id, courseId);
    const res = http.post(`${baseUrl}/memory-cards/decks`, JSON.stringify(deck), { headers });
    
    const jsonResponse = handleResponse(res, deckCreationDuration, 'Create deck');
    if (jsonResponse && jsonResponse.data) {
      deckId = jsonResponse.data.deckId;
    }
  });
  
  sleep(1);
  
  // 2. Add cards to the deck
  if (deckId) {
    group('Add Cards to Deck', function() {
      for (let i = 0; i < 3; i++) {
        const card = generateTestCard();
        const res = http.post(
          `${baseUrl}/memory-cards/decks/${deckId}/cards`, 
          JSON.stringify({
            ...card,
            userId: user.id,
          }), 
          { headers }
        );
        
        const jsonResponse = handleResponse(res, cardAdditionDuration, 'Add card');
        if (jsonResponse && jsonResponse.data) {
          cardIds.push(jsonResponse.data.cardId);
        }
        
        sleep(0.5);
      }
    });
  }
  
  sleep(1);
  
  // 3. Get due cards
  group('Get Due Cards', function() {
    const res = http.get(
      `${baseUrl}/memory-cards/users/${user.id}/due-cards?deckId=${deckId}&limit=10`, 
      { headers }
    );
    
    handleResponse(res, dueCardsFetchDuration, 'Get due cards');
  });
  
  sleep(1);
  
  // 4. Submit card reviews
  if (cardIds.length > 0) {
    group('Submit Card Reviews', function() {
      const ratings = ['again', 'hard', 'good', 'easy'];
      
      cardIds.forEach(cardId => {
        const rating = ratings[randomIntBetween(0, ratings.length - 1)];
        const reviewTime = randomIntBetween(5, 30);
        const sessionDuration = randomIntBetween(60, 300);
        
        const res = http.post(
          `${baseUrl}/memory-cards/reviews`, 
          JSON.stringify({
            userId: user.id,
            cardId,
            deckId,
            rating,
            reviewTime,
            sessionDuration,
          }), 
          { headers }
        );
        
        handleResponse(res, cardReviewDuration, 'Submit review');
        sleep(0.5);
      });
    });
  }
  
  sleep(1);
  
  // 5. Generate AI alternatives
  group('Generate AI Alternatives', function() {
    const res = http.post(
      `${baseUrl}/memory-cards/ai/alternatives`, 
      JSON.stringify({
        question: "What is the capital of France?",
        answer: "Paris",
      }), 
      { headers }
    );
    
    handleResponse(res, aiAlternativesGenDuration, 'Generate AI alternatives');
  });
  
  sleep(randomIntBetween(1, 3));
}