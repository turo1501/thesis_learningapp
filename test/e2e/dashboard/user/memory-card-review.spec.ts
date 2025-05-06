import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists, waitForNotification, generateTestId } from '../../utils/test-helpers';
import { USER_AUTH_DATA } from '../../../mock/data/users';

test.describe('Memory Card Review Process', () => {
  test.use({ storageState: 'e2e/storageState.student.json' });
  
  // Common selectors for memory card review
  const selectors = {
    // Navigation and setup
    deckItem: '.memory-card-deck-item',
    reviewButton: 'button:has-text("Review")',
    createDeckButton: 'button:has-text("Create Deck")',
    deckTitle: 'input[name="deckTitle"]',
    deckDescription: 'textarea[name="deckDescription"]',
    saveDeckButton: 'button:has-text("Save")',
    addCardButton: 'button:has-text("Add Card")',
    questionInput: 'textarea[name="question"]',
    answerInput: 'textarea[name="answer"]',
    saveCardButton: 'button:has-text("Save Card")',
    
    // Review specific selectors
    reviewContainer: '[data-testid="memory-card-review"]',
    cardContainer: '.card-container',
    cardFront: '.card-front',
    cardBack: '.card-back',
    flipButton: 'button:has-text("Flip")',
    
    // Rating buttons
    againButton: 'button:has-text("Again")',
    hardButton: 'button:has-text("Hard")',
    goodButton: 'button:has-text("Good")',
    easyButton: 'button:has-text("Easy")',
    
    // Review session information
    progressIndicator: '.review-progress',
    timeIndicator: '.review-time',
    
    // Review summary
    reviewSummary: '.review-summary',
    accuracyScore: '.accuracy-score',
    totalReviewed: '.total-reviewed',
    averageTime: '.average-time',
    finishButton: 'button:has-text("Finish")',
    continueButton: 'button:has-text("Continue")',
  };

  // Helper function to create a test deck with cards
  async function createTestDeckWithCards(page) {
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Click create deck button
    await page.locator(selectors.createDeckButton).click();
    
    // Fill in deck details
    const uniqueId = generateTestId();
    const deckName = `Review Test Deck ${uniqueId}`;
    
    await page.locator(selectors.deckTitle).fill(deckName);
    await page.locator(selectors.deckDescription).fill('Test deck for reviewing memory cards');
    
    // Save the deck
    await page.locator(selectors.saveDeckButton).click();
    await waitForNotification(page, "Deck created successfully");
    
    // Find and click on the newly created deck
    await page.locator(selectors.deckItem, { hasText: deckName }).click();
    
    // Add multiple cards to ensure we have enough for review
    const cardData = [
      { question: 'What is the capital of France?', answer: 'Paris' },
      { question: 'What is the capital of Germany?', answer: 'Berlin' },
      { question: 'What is the capital of Italy?', answer: 'Rome' },
      { question: 'What is the capital of Spain?', answer: 'Madrid' },
      { question: 'What is the capital of Portugal?', answer: 'Lisbon' }
    ];
    
    for (const card of cardData) {
      // Click add card button
      await page.locator(selectors.addCardButton).click();
      
      // Fill in card details
      await page.locator(selectors.questionInput).fill(card.question);
      await page.locator(selectors.answerInput).fill(card.answer);
      
      // Save the card
      await page.locator(selectors.saveCardButton).click();
      await waitForNotification(page, "Card added successfully");
    }
    
    return deckName;
  }
  
  test('should complete a full memory card review session', async ({ page }) => {
    // Create a test deck with cards
    const deckName = await createTestDeckWithCards(page);
    
    // Navigate back to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find the deck and click review button
    await page.locator(selectors.deckItem, { hasText: deckName })
      .locator(selectors.reviewButton).click();
    
    // Verify we're in review mode
    await assertElementExists(page, selectors.reviewContainer);
    await assertElementExists(page, selectors.cardFront);
    
    // Start tracking review metrics
    let cardsReviewed = 0;
    let correctAnswers = 0;
    
    // Review cards until session is complete
    while (await page.locator(selectors.cardContainer).isVisible()) {
      // Read the current card's question
      const questionText = await page.locator(selectors.cardFront).textContent();
      expect(questionText?.length).toBeGreaterThan(0);
      
      // Flip the card to see the answer
      await page.locator(selectors.flipButton).click();
      
      // Verify card is flipped and shows answer
      await assertElementExists(page, selectors.cardBack);
      const answerText = await page.locator(selectors.cardBack).textContent();
      expect(answerText?.length).toBeGreaterThan(0);
      
      // Rate the card (alternating between different ratings for testing)
      const ratingOptions = [
        selectors.againButton, 
        selectors.hardButton, 
        selectors.goodButton, 
        selectors.easyButton
      ];
      
      const ratingToUse = ratingOptions[cardsReviewed % ratingOptions.length];
      
      // Count this as correct for 'good' and 'easy' ratings
      if (ratingToUse === selectors.goodButton || ratingToUse === selectors.easyButton) {
        correctAnswers++;
      }
      
      await page.locator(ratingToUse).click();
      cardsReviewed++;
      
      // Check if we're done (review summary is visible)
      if (await page.locator(selectors.reviewSummary).isVisible()) {
        break;
      }
      
      // If we've reviewed all 5 cards, break to avoid infinite loop
      if (cardsReviewed >= 5) {
        break;
      }
    }
    
    // Verify review summary is shown
    await assertElementExists(page, selectors.reviewSummary);
    
    // Verify the summary contains expected information
    await assertElementExists(page, selectors.accuracyScore);
    await assertElementExists(page, selectors.totalReviewed);
    await assertElementExists(page, selectors.averageTime);
    
    // Verify the total reviewed count matches our tracking
    const totalReviewedText = await page.locator(selectors.totalReviewed).textContent();
    expect(totalReviewedText).toContain(String(cardsReviewed));
    
    // Click finish button
    await page.locator(selectors.finishButton).click();
    
    // Verify we're returned to the decks view
    await assertElementExists(page, selectors.deckItem, { text: deckName });
  });
  
  test('should track review session time correctly', async ({ page }) => {
    // Create a test deck with cards if it doesn't exist
    await createTestDeckWithCards(page);
    
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find and click review button on the first deck
    await page.locator(`${selectors.deckItem} ${selectors.reviewButton}`).first().click();
    
    // Verify the time indicator starts at 0:00
    const initialTime = await page.locator(selectors.timeIndicator).textContent();
    expect(initialTime).toContain('0:00');
    
    // Wait at least 5 seconds to ensure timer increments
    await page.waitForTimeout(5000);
    
    // Verify time has advanced
    const updatedTime = await page.locator(selectors.timeIndicator).textContent();
    expect(updatedTime).not.toEqual(initialTime);
    
    // Flip and rate a card
    await page.locator(selectors.flipButton).click();
    await page.locator(selectors.goodButton).click();
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Verify time continues to advance
    const finalTime = await page.locator(selectors.timeIndicator).textContent();
    expect(finalTime).not.toEqual(updatedTime);
  });
  
  test('should allow continuing review after summary', async ({ page }) => {
    // Create a test deck with cards if it doesn't exist
    const deckName = await createTestDeckWithCards(page);
    
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find the deck and click review button
    await page.locator(selectors.deckItem, { hasText: deckName })
      .locator(selectors.reviewButton).click();
    
    // Review one card
    await page.locator(selectors.flipButton).click();
    await page.locator(selectors.goodButton).click();
    
    // Skip to end of review (we'll assume we've seen all the cards)
    while (!await page.locator(selectors.reviewSummary).isVisible()) {
      if (await page.locator(selectors.cardFront).isVisible()) {
        await page.locator(selectors.flipButton).click();
        await page.locator(selectors.goodButton).click();
      } else {
        break;
      }
    }
    
    // Verify review summary is shown
    await assertElementExists(page, selectors.reviewSummary);
    
    // Check if continue button exists, if it does click it
    if (await page.locator(selectors.continueButton).isVisible()) {
      await page.locator(selectors.continueButton).click();
      
      // Verify we're back in review mode
      await assertElementExists(page, selectors.cardFront);
      
      // Complete one more card
      await page.locator(selectors.flipButton).click();
      await page.locator(selectors.goodButton).click();
      
      // Verify summary shown again
      await assertElementExists(page, selectors.reviewSummary);
    }
    
    // Finish the review
    await page.locator(selectors.finishButton).click();
  });
  
  test('should show progress during review session', async ({ page }) => {
    // Create a test deck with cards if it doesn't exist
    await createTestDeckWithCards(page);
    
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find and click review button on the first deck
    await page.locator(`${selectors.deckItem} ${selectors.reviewButton}`).first().click();
    
    // Verify progress indicator is visible
    await assertElementExists(page, selectors.progressIndicator);
    
    // Get initial progress text
    const initialProgress = await page.locator(selectors.progressIndicator).textContent();
    
    // Review one card
    await page.locator(selectors.flipButton).click();
    await page.locator(selectors.goodButton).click();
    
    // Check if we're still in review mode (not finished)
    if (await page.locator(selectors.cardFront).isVisible()) {
      // Verify progress has updated
      const updatedProgress = await page.locator(selectors.progressIndicator).textContent();
      expect(updatedProgress).not.toEqual(initialProgress);
    }
    
    // Continue reviewing until finished
    while (await page.locator(selectors.cardFront).isVisible()) {
      await page.locator(selectors.flipButton).click();
      await page.locator(selectors.goodButton).click();
    }
    
    // Finish the review
    await page.locator(selectors.finishButton).click();
  });
}); 
import { navigateTo, assertElementExists, waitForNotification, generateTestId } from '../../utils/test-helpers';
import { USER_AUTH_DATA } from '../../../mock/data/users';

test.describe('Memory Card Review Process', () => {
  test.use({ storageState: 'e2e/storageState.student.json' });
  
  // Common selectors for memory card review
  const selectors = {
    // Navigation and setup
    deckItem: '.memory-card-deck-item',
    reviewButton: 'button:has-text("Review")',
    createDeckButton: 'button:has-text("Create Deck")',
    deckTitle: 'input[name="deckTitle"]',
    deckDescription: 'textarea[name="deckDescription"]',
    saveDeckButton: 'button:has-text("Save")',
    addCardButton: 'button:has-text("Add Card")',
    questionInput: 'textarea[name="question"]',
    answerInput: 'textarea[name="answer"]',
    saveCardButton: 'button:has-text("Save Card")',
    
    // Review specific selectors
    reviewContainer: '[data-testid="memory-card-review"]',
    cardContainer: '.card-container',
    cardFront: '.card-front',
    cardBack: '.card-back',
    flipButton: 'button:has-text("Flip")',
    
    // Rating buttons
    againButton: 'button:has-text("Again")',
    hardButton: 'button:has-text("Hard")',
    goodButton: 'button:has-text("Good")',
    easyButton: 'button:has-text("Easy")',
    
    // Review session information
    progressIndicator: '.review-progress',
    timeIndicator: '.review-time',
    
    // Review summary
    reviewSummary: '.review-summary',
    accuracyScore: '.accuracy-score',
    totalReviewed: '.total-reviewed',
    averageTime: '.average-time',
    finishButton: 'button:has-text("Finish")',
    continueButton: 'button:has-text("Continue")',
  };

  // Helper function to create a test deck with cards
  async function createTestDeckWithCards(page) {
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Click create deck button
    await page.locator(selectors.createDeckButton).click();
    
    // Fill in deck details
    const uniqueId = generateTestId();
    const deckName = `Review Test Deck ${uniqueId}`;
    
    await page.locator(selectors.deckTitle).fill(deckName);
    await page.locator(selectors.deckDescription).fill('Test deck for reviewing memory cards');
    
    // Save the deck
    await page.locator(selectors.saveDeckButton).click();
    await waitForNotification(page, "Deck created successfully");
    
    // Find and click on the newly created deck
    await page.locator(selectors.deckItem, { hasText: deckName }).click();
    
    // Add multiple cards to ensure we have enough for review
    const cardData = [
      { question: 'What is the capital of France?', answer: 'Paris' },
      { question: 'What is the capital of Germany?', answer: 'Berlin' },
      { question: 'What is the capital of Italy?', answer: 'Rome' },
      { question: 'What is the capital of Spain?', answer: 'Madrid' },
      { question: 'What is the capital of Portugal?', answer: 'Lisbon' }
    ];
    
    for (const card of cardData) {
      // Click add card button
      await page.locator(selectors.addCardButton).click();
      
      // Fill in card details
      await page.locator(selectors.questionInput).fill(card.question);
      await page.locator(selectors.answerInput).fill(card.answer);
      
      // Save the card
      await page.locator(selectors.saveCardButton).click();
      await waitForNotification(page, "Card added successfully");
    }
    
    return deckName;
  }
  
  test('should complete a full memory card review session', async ({ page }) => {
    // Create a test deck with cards
    const deckName = await createTestDeckWithCards(page);
    
    // Navigate back to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find the deck and click review button
    await page.locator(selectors.deckItem, { hasText: deckName })
      .locator(selectors.reviewButton).click();
    
    // Verify we're in review mode
    await assertElementExists(page, selectors.reviewContainer);
    await assertElementExists(page, selectors.cardFront);
    
    // Start tracking review metrics
    let cardsReviewed = 0;
    let correctAnswers = 0;
    
    // Review cards until session is complete
    while (await page.locator(selectors.cardContainer).isVisible()) {
      // Read the current card's question
      const questionText = await page.locator(selectors.cardFront).textContent();
      expect(questionText?.length).toBeGreaterThan(0);
      
      // Flip the card to see the answer
      await page.locator(selectors.flipButton).click();
      
      // Verify card is flipped and shows answer
      await assertElementExists(page, selectors.cardBack);
      const answerText = await page.locator(selectors.cardBack).textContent();
      expect(answerText?.length).toBeGreaterThan(0);
      
      // Rate the card (alternating between different ratings for testing)
      const ratingOptions = [
        selectors.againButton, 
        selectors.hardButton, 
        selectors.goodButton, 
        selectors.easyButton
      ];
      
      const ratingToUse = ratingOptions[cardsReviewed % ratingOptions.length];
      
      // Count this as correct for 'good' and 'easy' ratings
      if (ratingToUse === selectors.goodButton || ratingToUse === selectors.easyButton) {
        correctAnswers++;
      }
      
      await page.locator(ratingToUse).click();
      cardsReviewed++;
      
      // Check if we're done (review summary is visible)
      if (await page.locator(selectors.reviewSummary).isVisible()) {
        break;
      }
      
      // If we've reviewed all 5 cards, break to avoid infinite loop
      if (cardsReviewed >= 5) {
        break;
      }
    }
    
    // Verify review summary is shown
    await assertElementExists(page, selectors.reviewSummary);
    
    // Verify the summary contains expected information
    await assertElementExists(page, selectors.accuracyScore);
    await assertElementExists(page, selectors.totalReviewed);
    await assertElementExists(page, selectors.averageTime);
    
    // Verify the total reviewed count matches our tracking
    const totalReviewedText = await page.locator(selectors.totalReviewed).textContent();
    expect(totalReviewedText).toContain(String(cardsReviewed));
    
    // Click finish button
    await page.locator(selectors.finishButton).click();
    
    // Verify we're returned to the decks view
    await assertElementExists(page, selectors.deckItem, { text: deckName });
  });
  
  test('should track review session time correctly', async ({ page }) => {
    // Create a test deck with cards if it doesn't exist
    await createTestDeckWithCards(page);
    
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find and click review button on the first deck
    await page.locator(`${selectors.deckItem} ${selectors.reviewButton}`).first().click();
    
    // Verify the time indicator starts at 0:00
    const initialTime = await page.locator(selectors.timeIndicator).textContent();
    expect(initialTime).toContain('0:00');
    
    // Wait at least 5 seconds to ensure timer increments
    await page.waitForTimeout(5000);
    
    // Verify time has advanced
    const updatedTime = await page.locator(selectors.timeIndicator).textContent();
    expect(updatedTime).not.toEqual(initialTime);
    
    // Flip and rate a card
    await page.locator(selectors.flipButton).click();
    await page.locator(selectors.goodButton).click();
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Verify time continues to advance
    const finalTime = await page.locator(selectors.timeIndicator).textContent();
    expect(finalTime).not.toEqual(updatedTime);
  });
  
  test('should allow continuing review after summary', async ({ page }) => {
    // Create a test deck with cards if it doesn't exist
    const deckName = await createTestDeckWithCards(page);
    
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find the deck and click review button
    await page.locator(selectors.deckItem, { hasText: deckName })
      .locator(selectors.reviewButton).click();
    
    // Review one card
    await page.locator(selectors.flipButton).click();
    await page.locator(selectors.goodButton).click();
    
    // Skip to end of review (we'll assume we've seen all the cards)
    while (!await page.locator(selectors.reviewSummary).isVisible()) {
      if (await page.locator(selectors.cardFront).isVisible()) {
        await page.locator(selectors.flipButton).click();
        await page.locator(selectors.goodButton).click();
      } else {
        break;
      }
    }
    
    // Verify review summary is shown
    await assertElementExists(page, selectors.reviewSummary);
    
    // Check if continue button exists, if it does click it
    if (await page.locator(selectors.continueButton).isVisible()) {
      await page.locator(selectors.continueButton).click();
      
      // Verify we're back in review mode
      await assertElementExists(page, selectors.cardFront);
      
      // Complete one more card
      await page.locator(selectors.flipButton).click();
      await page.locator(selectors.goodButton).click();
      
      // Verify summary shown again
      await assertElementExists(page, selectors.reviewSummary);
    }
    
    // Finish the review
    await page.locator(selectors.finishButton).click();
  });
  
  test('should show progress during review session', async ({ page }) => {
    // Create a test deck with cards if it doesn't exist
    await createTestDeckWithCards(page);
    
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
    
    // Find and click review button on the first deck
    await page.locator(`${selectors.deckItem} ${selectors.reviewButton}`).first().click();
    
    // Verify progress indicator is visible
    await assertElementExists(page, selectors.progressIndicator);
    
    // Get initial progress text
    const initialProgress = await page.locator(selectors.progressIndicator).textContent();
    
    // Review one card
    await page.locator(selectors.flipButton).click();
    await page.locator(selectors.goodButton).click();
    
    // Check if we're still in review mode (not finished)
    if (await page.locator(selectors.cardFront).isVisible()) {
      // Verify progress has updated
      const updatedProgress = await page.locator(selectors.progressIndicator).textContent();
      expect(updatedProgress).not.toEqual(initialProgress);
    }
    
    // Continue reviewing until finished
    while (await page.locator(selectors.cardFront).isVisible()) {
      await page.locator(selectors.flipButton).click();
      await page.locator(selectors.goodButton).click();
    }
    
    // Finish the review
    await page.locator(selectors.finishButton).click();
  });
}); 