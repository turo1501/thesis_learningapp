import { test as setup, expect } from '@playwright/test';
import { USER_AUTH_DATA } from '../mock/data/users';

// This file is used to set up authentication state that will be shared across tests
// Store signed-in state in 'storageState.json' to be used in tests that require authentication

const authFile = 'e2e/storageState.json';

// Create a setup for each user role
for (const [role, userData] of Object.entries(USER_AUTH_DATA)) {
  setup(`authenticate as ${role.toLowerCase()}`, async ({ page }) => {
    // Navigate to the login page
    await page.goto('/signin');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Fill in the Clerk authentication form
    // Note: The exact selectors may need to be updated based on your Clerk implementation
    await page.locator('input[name="identifier"]').fill(userData.email);
    await page.locator('input[name="password"]').fill(userData.password);
    await page.getByRole('button', { name: /sign in/i, exact: false }).click();
    
    // Wait for authentication to complete
    await page.waitForURL(/dashboard/);
    
    // Verify we are successfully logged in
    await expect(page).toHaveURL(/dashboard/);
    
    // Store the authentication state to be used across tests
    await page.context().storageState({ path: authFile.replace('.json', `.${role.toLowerCase()}.json`) });
  });
}

// Default auth (student role)
setup('authenticate with default role (student)', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/signin');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');

  // Fill in the Clerk authentication form
  await page.locator('input[name="identifier"]').fill(USER_AUTH_DATA.STUDENT.email);
  await page.locator('input[name="password"]').fill(USER_AUTH_DATA.STUDENT.password);
  await page.getByRole('button', { name: /sign in/i, exact: false }).click();
  
  // Wait for authentication to complete
  await page.waitForURL(/dashboard/);
  
  // Verify we are successfully logged in
  await expect(page).toHaveURL(/dashboard/);
  
  // Store the authentication state to be used across tests
  await page.context().storageState({ path: authFile });
  
  // Add the token to localStorage
  await page.evaluate((token) => {
    localStorage.setItem('clerk-auth-token', token);
  }, USER_AUTH_DATA.STUDENT.token);
});