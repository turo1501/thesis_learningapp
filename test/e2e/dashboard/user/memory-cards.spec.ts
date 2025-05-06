import { test, expect } from '@playwright/test';
import { navigateTo, setAuthToken, assertElementExists, navigateSidebar, generateTestId, waitForNotification } from '../../utils/test-helpers';
import { USER_AUTH_DATA } from '../../../mock/data/users';

test.describe('Memory Cards (Student Dashboard)', () => {
  test.use({ storageState: 'e2e/storageState.student.json' });
  
  // Common selectors for reuse
  const selectors = {
    createDeckButton: 'button:has-text("Create Deck")',
    deckItem: '.memory-card-deck-item',
    reviewButton: 'button:has-text("Review")',
    deckTitle: 'input[name="deckTitle"]',
    deckDescription: 'textarea[name="deckDescription"]',
    saveDeckButton: 'button:has-text("Save")',
    addCardButton: 'button:has-text("Add Card")',
    questionInput: 'textarea[name="question"]',
    answerInput: 'textarea[name="answer"]',
    saveCardButton: 'button:has-text("Save Card")',
    cardItem: '.memory-card-item',
    cardFront: '.card-front',
    cardBack: '.card-back',
    flipButton: 'button:has-text("Flip")',
    againButton: 'button:has-text("Again")',
    hardButton: 'button:has-text("Hard")',
    goodButton: 'button:has-text("Good")',
    easyButton: 'button:has-text("Easy")',
    aiAlternativesButton: 'button:has-text("Generate Alternatives")',
    aiAlternativeItem: '.ai-alternative-item',
    applyAlternativeButton: 'button:has-text("Apply")',
    reviewSummary: '.review-summary',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to memory cards page
    await navigateTo(page, '/user/memory-cards');
  });

  test('should display memory cards dashboard', async ({ page }) => {
    // Verify page title
    await assertElementExists(page, 'h1', { text: /memory cards/i });
    
    // Verify create deck button exists
    await assertElementExists(page, selectors.createDeckButton);
    
    // Verify memory card decks section
    await assertElementExists(page, '[data-testid="memory-card-decks"]');
  });

  test('should create a new memory card deck', async ({ page }) => {
    // Click create deck button
    await page.locator(selectors.createDeckButton).click();
    
    // Fill in deck details
    const uniqueId = generateTestId();
    const deckName = `Test Deck ${uniqueId}`;
    
    await page.locator(selectors.deckTitle).fill(deckName);
    await page.locator(selectors.deckDescription).fill('This is a test deck created by automated testing');
    
    // Save the deck
    await page.locator(selectors.saveDeckButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /created successfully/i);
    
    // Verify deck appears in the list
    await assertElementExists(page, selectors.deckItem, { text: deckName });
  });

  test('should add cards to an existing deck', async ({ page }) => {
    // Find the first deck and click on it
    await page.locator(selectors.deckItem).first().click();
    
    // Click add card button
    await page.locator(selectors.addCardButton).click();
    
    // Fill in card details
    const question = 'What is the capital of France?';
    const answer = 'Paris';
    
    await page.locator(selectors.questionInput).fill(question);
    await page.locator(selectors.answerInput).fill(answer);
    
    // Save the card
    await page.locator(selectors.saveCardButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /card added/i);
    
    // Verify card appears in the list
    await assertElementExists(page, selectors.cardItem, { text: question });
  });

  test('should review cards in a deck', async ({ page }) => {
    // Find the first deck and click review button
    await page.locator(`${selectors.deckItem} ${selectors.reviewButton}`).first().click();
    
    // Verify we're in review mode
    await assertElementExists(page, selectors.cardFront);
    
    // Flip the card
    await page.locator(selectors.flipButton).click();
    
    // Verify card is flipped
    await assertElementExists(page, selectors.cardBack);
    
    // Rate the card
    await page.locator(selectors.goodButton).click();
    
    // Continue until review is complete or next card appears
    while (await page.locator(selectors.cardFront).isVisible()) {
      await page.locator(selectors.flipButton).click();
      await page.locator(selectors.goodButton).click();
      
      // Break if we see the summary (means review is complete)
      if (await page.locator(selectors.reviewSummary).isVisible()) {
        break;
      }
    }
    
    // Verify review summary is shown eventually
    await assertElementExists(page, selectors.reviewSummary);
  });

  test('should generate AI alternatives for a card', async ({ page }) => {
    // Find the first deck and click on it
    await page.locator(selectors.deckItem).first().click();
    
    // Select the first card
    await page.locator(selectors.cardItem).first().click();
    
    // Click generate alternatives button
    await page.locator(selectors.aiAlternativesButton).click();
    
    // Wait for AI alternatives to be generated
    await page.waitForSelector(selectors.aiAlternativeItem, { timeout: 15000 });
    
    // Verify alternatives are shown
    await assertElementExists(page, selectors.aiAlternativeItem);
    
    // Apply an alternative
    await page.locator(`${selectors.aiAlternativeItem} ${selectors.applyAlternativeButton}`).first().click();
    
    // Wait for success notification
    await waitForNotification(page, /applied/i);
  });

  test('should delete a card from a deck', async ({ page }) => {
    // Find the first deck and click on it
    await page.locator(selectors.deckItem).first().click();
    
    // Count initial number of cards
    const initialCardCount = await page.locator(selectors.cardItem).count();
    
    // Select the first card and open the menu
    await page.locator(selectors.cardItem).first().click();
    await page.locator(`${selectors.cardItem} button[aria-label="Menu"]`).first().click();
    
    // Click delete option
    await page.getByRole('menuitem', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Wait for success notification
    await waitForNotification(page, /deleted/i);
    
    // Verify card count decreased
    const newCardCount = await page.locator(selectors.cardItem).count();
    expect(newCardCount).toBeLessThan(initialCardCount);
  });

  test('should edit a memory card deck', async ({ page }) => {
    // Find the first deck and open menu
    await page.locator(`${selectors.deckItem} button[aria-label="Menu"]`).first().click();
    
    // Click edit option
    await page.getByRole('menuitem', { name: /edit/i }).click();
    
    // Update deck title
    const updatedTitle = `Updated Deck ${generateTestId()}`;
    await page.locator(selectors.deckTitle).fill(updatedTitle);
    
    // Save changes
    await page.locator(selectors.saveDeckButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /updated/i);
    
    // Verify updated title appears
    await assertElementExists(page, selectors.deckItem, { text: updatedTitle });
  });
});