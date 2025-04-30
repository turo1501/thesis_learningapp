import { Page, expect } from '@playwright/test';

/**
 * Test helper functions for common operations in E2E tests
 */

/**
 * Navigate to a specific page and wait for it to load
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Authenticate as a user with a specific role using localStorage
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.evaluate((authToken) => {
    localStorage.setItem('clerk-auth-token', authToken);
  }, token);
}

/**
 * Fill a form field with the given value
 */
export async function fillFormField(page: Page, fieldName: string, value: string): Promise<void> {
  await page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`).fill(value);
}

/**
 * Submit a form by clicking the submit button
 */
export async function submitForm(page: Page, submitButtonText: string = 'Submit'): Promise<void> {
  await page.getByRole('button', { name: new RegExp(submitButtonText, 'i') }).click();
}

/**
 * Wait for a notification to appear
 */
export async function waitForNotification(page: Page, text?: string): Promise<void> {
  if (text) {
    await page.waitForSelector(`text=${text}`);
  } else {
    // Generic notification selector - adjust based on your implementation
    await page.waitForSelector('[data-testid="notification"]');
  }
}

/**
 * Verify that an element exists on the page
 */
export async function assertElementExists(
  page: Page, 
  selector: string, 
  options: { text?: string | RegExp, visible?: boolean } = {}
): Promise<void> {
  const locator = options.text 
    ? page.locator(selector, { hasText: options.text })
    : page.locator(selector);
  
  await expect(locator).toBeVisible({ visible: options.visible ?? true });
}

/**
 * Wait for a page navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForURL(urlPattern);
}

/**
 * Take a screenshot for debugging purposes
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `./test-results/screenshots/${name}.png` });
}

/**
 * Helper to interact with the dashboard sidebar navigation
 */
export async function navigateSidebar(page: Page, menuItem: string): Promise<void> {
  await page.locator('.sidebar-nav').getByText(menuItem, { exact: false }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Generate a unique test identifier to avoid test data collisions
 */
export function generateTestId(): string {
  return `test-${Math.floor(Math.random() * 10000)}-${Date.now()}`;
}

/**
 * Wait for all API requests to complete
 */
export async function waitForApiRequests(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Clear local storage between tests
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get text content from an element
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  return await page.locator(selector).textContent() || '';
}

/**
 * Check if an element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).isVisible();
}