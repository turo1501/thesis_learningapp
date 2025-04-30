import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists, waitForNotification, generateTestId } from '../../utils/test-helpers';
import { USER_AUTH_DATA } from '../../../mock/data/users';

test.describe('Course Management (Teacher Dashboard)', () => {
  test.use({ storageState: 'e2e/storageState.teacher.json' });
  
  // Common selectors for reuse
  const selectors = {
    createCourseButton: 'button:has-text("Create Course")',
    courseItem: '.teacher-course-card',
    courseTitle: 'input[name="title"]',
    courseDescription: 'textarea[name="description"]',
    courseCategory: 'select[name="category"]',
    coursePrice: 'input[name="price"]',
    courseLevel: 'select[name="level"]',
    courseStatus: 'select[name="status"]',
    saveButton: 'button:has-text("Save")',
    publishButton: 'button:has-text("Publish")',
    editButton: 'button:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
    addSectionButton: 'button:has-text("Add Section")',
    sectionTitle: 'input[name="sectionTitle"]',
    addChapterButton: 'button:has-text("Add Chapter")',
    chapterTitle: 'input[name="title"]',
    chapterContent: 'div[role="textbox"]',
    chapterType: 'select[name="type"]',
    searchInput: 'input[placeholder*="Search"]',
    toolbarCategory: 'select[data-testid="category-filter"]',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to teacher courses page
    await navigateTo(page, '/teacher/courses');
  });

  test('should display teacher courses dashboard', async ({ page }) => {
    // Verify page title
    await assertElementExists(page, 'h1', { text: /courses/i });
    
    // Verify create course button exists
    await assertElementExists(page, selectors.createCourseButton);
  });

  test('should create a new course', async ({ page }) => {
    // Click create course button
    await page.locator(selectors.createCourseButton).click();
    
    // Verify navigation to course editor
    await expect(page).toHaveURL(/\/teacher\/courses\/.+/);
    
    // Fill in course details
    const uniqueId = generateTestId();
    const courseName = `Test Course ${uniqueId}`;
    
    await page.locator(selectors.courseTitle).fill(courseName);
    await page.locator(selectors.courseDescription).fill('This is a test course created by automated testing');
    await page.locator(selectors.courseCategory).selectOption('Web Development');
    await page.locator(selectors.coursePrice).fill('49.99');
    await page.locator(selectors.courseLevel).selectOption('Beginner');
    
    // Save the course
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /saved/i);
    
    // Navigate back to courses page
    await navigateTo(page, '/teacher/courses');
    
    // Verify course appears in the list
    await assertElementExists(page, selectors.courseItem, { text: courseName });
  });

  test('should edit an existing course', async ({ page }) => {
    // Find the first course and click edit
    await page.locator(`${selectors.courseItem} ${selectors.editButton}`).first().click();
    
    // Verify navigation to course editor
    await expect(page).toHaveURL(/\/teacher\/courses\/.+/);
    
    // Update course title
    const updatedTitle = `Updated Course ${generateTestId()}`;
    await page.locator(selectors.courseTitle).fill(updatedTitle);
    
    // Save changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /saved/i);
    
    // Navigate back to courses page
    await navigateTo(page, '/teacher/courses');
    
    // Verify updated title appears
    await assertElementExists(page, selectors.courseItem, { text: updatedTitle });
  });

  test('should add a section to a course', async ({ page }) => {
    // Find the first course and click edit
    await page.locator(`${selectors.courseItem} ${selectors.editButton}`).first().click();
    
    // Click add section button
    await page.locator(selectors.addSectionButton).click();
    
    // Fill in section details
    const sectionName = `Test Section ${generateTestId()}`;
    await page.locator(selectors.sectionTitle).fill(sectionName);
    
    // Save the section
    await page.locator('button:has-text("Add Section")').nth(1).click();
    
    // Wait for section to be added
    await assertElementExists(page, '.course-section', { text: sectionName });
    
    // Save course changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /saved/i);
  });

  test('should add a chapter to a section', async ({ page }) => {
    // Find the first course and click edit
    await page.locator(`${selectors.courseItem} ${selectors.editButton}`).first().click();
    
    // Wait for sections to load
    await page.waitForSelector('.course-section');
    
    // Click "Add Chapter" on the first section
    await page.locator('.course-section').first().locator(selectors.addChapterButton).click();
    
    // Fill in chapter details
    const chapterName = `Test Chapter ${generateTestId()}`;
    await page.locator(selectors.chapterTitle).fill(chapterName);
    await page.locator(selectors.chapterType).selectOption('Text');
    
    // Fill in content (using content editable div)
    await page.locator(selectors.chapterContent).fill('This is test content for the chapter.');
    
    // Save the chapter
    await page.locator('button:has-text("Save Chapter")').click();
    
    // Wait for chapter to be added
    await assertElementExists(page, '.course-chapter', { text: chapterName });
    
    // Save course changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /saved/i);
  });

  test('should publish a course', async ({ page }) => {
    // Find the first course with "Draft" status
    await page.locator(selectors.courseItem).filter({ hasText: 'Draft' }).first().locator(selectors.editButton).click();
    
    // Change status to Published
    await page.locator(selectors.courseStatus).selectOption('Published');
    
    // Save changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /saved/i);
    
    // Navigate back to courses page
    await navigateTo(page, '/teacher/courses');
    
    // Verify course is now published
    await assertElementExists(page, selectors.courseItem, { text: 'Published' });
  });

  test('should filter courses by category', async ({ page }) => {
    // Get count of all courses
    const initialCount = await page.locator(selectors.courseItem).count();
    
    // Select a specific category
    await page.locator(selectors.toolbarCategory).selectOption('Web Development');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Get count of filtered courses
    const filteredCount = await page.locator(selectors.courseItem).count();
    
    // Verify filtering worked (either fewer results or same if all were in that category)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // If there are results, verify they match the selected category
    if (filteredCount > 0) {
      await assertElementExists(page, selectors.courseItem, { text: 'Web Development' });
    }
  });

  test('should search for courses by title', async ({ page }) => {
    // Get first course title
    const firstCourseTitle = await page.locator(`${selectors.courseItem} h3`).first().textContent();
    const searchTerm = firstCourseTitle?.split(' ')[0] || '';
    
    // Search for the course
    await page.locator(selectors.searchInput).fill(searchTerm);
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify results contain the search term
    await assertElementExists(page, selectors.courseItem, { text: searchTerm });
  });

  test('should delete a course', async ({ page }) => {
    // Count initial number of courses
    const initialCount = await page.locator(selectors.courseItem).count();
    
    // Find the first course and click delete
    await page.locator(`${selectors.courseItem} ${selectors.deleteButton}`).first().click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Wait for success notification
    await waitForNotification(page, /deleted/i);
    
    // Verify course count decreased
    await page.waitForTimeout(500);
    const newCount = await page.locator(selectors.courseItem).count();
    expect(newCount).toBeLessThan(initialCount);
  });
});