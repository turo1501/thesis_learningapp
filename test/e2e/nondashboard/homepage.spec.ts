import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists } from '../utils/test-helpers';

test.describe('Homepage (Non-Dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage for each test
    await navigateTo(page, '/');
  });

  test('should display the main title and subtitle', async ({ page }) => {
    // Verify that the main title exists
    await assertElementExists(page, 'h1');
    
    // Verify page subtitle
    await assertElementExists(page, 'p.hero-subtitle');
  });

  test('should display navigation bar with correct links', async ({ page }) => {
    // Check if navbar exists
    await assertElementExists(page, 'nav.nondashboard-navbar');
    
    // Check for blog link
    await assertElementExists(page, 'a[href="/blog"]');
    
    // Check for search link
    await assertElementExists(page, 'a[href="/search"]');
    
    // Check for login/signup buttons for non-authenticated users
    await assertElementExists(page, 'a[href="/signin"]');
    await assertElementExists(page, 'a[href="/signup"]');
  });

  test('should navigate to search page when clicking search', async ({ page }) => {
    // Click the search link
    await page.locator('a[href="/search"]').click();
    
    // Verify navigation to search page
    await expect(page).toHaveURL('/search');
  });

  test('should navigate to blog page when clicking blog', async ({ page }) => {
    // Click the blog link
    await page.locator('a[href="/blog"]').click();
    
    // Verify navigation to blog page
    await expect(page).toHaveURL('/blog');
  });

  test('should navigate to login page when clicking login', async ({ page }) => {
    // Click the login button
    await page.locator('a[href="/signin"]').click();
    
    // Verify navigation to login page
    await expect(page).toHaveURL('/signin');
  });

  test('should navigate to signup page when clicking signup', async ({ page }) => {
    // Click the signup button
    await page.locator('a[href="/signup"]').click();
    
    // Verify navigation to signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should display featured courses section', async ({ page }) => {
    // Check if featured courses section exists
    await assertElementExists(page, '[data-testid="featured-courses"]', { visible: true });
    
    // Check if at least one course card is displayed
    await assertElementExists(page, '.course-card');
  });

  test('should display CTA (Call to Action) section', async ({ page }) => {
    // Check if CTA section exists
    await assertElementExists(page, '.cta-section');
    
    // Check if CTA button exists and has correct text
    await assertElementExists(page, '.cta-section button', { text: /get started/i });
  });

  test('should display footer with essential links', async ({ page }) => {
    // Check if footer exists
    await assertElementExists(page, 'footer');
    
    // Check for essential footer links
    await assertElementExists(page, 'footer a[href="/about"]');
    await assertElementExists(page, 'footer a[href="/contact"]');
    await assertElementExists(page, 'footer a[href="/terms"]');
    await assertElementExists(page, 'footer a[href="/privacy"]');
  });

  test('should have responsive design for mobile viewport', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu button is visible
    await assertElementExists(page, '.mobile-menu-button');
    
    // Verify navbar is in mobile mode
    await expect(page.locator('nav.nondashboard-navbar')).toHaveClass(/mobile/);
  });
});