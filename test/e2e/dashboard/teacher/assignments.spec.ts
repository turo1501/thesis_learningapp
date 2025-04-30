import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists, waitForNotification, generateTestId } from '../../utils/test-helpers';
import { USER_AUTH_DATA } from '../../../mock/data/users';

test.describe('Assignments (Teacher Dashboard)', () => {
  test.use({ storageState: 'e2e/storageState.teacher.json' });
  
  // Common selectors for reuse
  const selectors = {
    createAssignmentButton: 'button:has-text("Create Assignment")',
    assignmentItem: '.assignment-item',
    assignmentTitle: 'input[name="title"]',
    assignmentDescription: 'textarea[name="description"]',
    courseSelect: 'select[name="courseId"]',
    dueDate: 'input[type="date"]',
    assignmentPoints: 'input[name="points"]',
    assignmentStatus: 'select[name="status"]',
    saveButton: 'button:has-text("Save")',
    publishButton: 'button:has-text("Publish")',
    editButton: 'button:has-text("Edit")',
    viewButton: 'button:has-text("View")',
    deleteButton: 'button:has-text("Delete")',
    submissionsTab: 'button:has-text("Submissions")',
    gradeSubmissionButton: 'button:has-text("Grade")',
    gradeInput: 'input[name="grade"]',
    feedbackInput: 'textarea[name="feedback"]',
    submitGradeButton: 'button:has-text("Submit Grade")',
    searchInput: 'input[placeholder*="Search"]',
    statusFilter: 'select[data-testid="status-filter"]',
    courseFilter: 'select[data-testid="course-filter"]',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to teacher assignments page
    await navigateTo(page, '/teacher/assignments');
  });

  test('should display assignments dashboard', async ({ page }) => {
    // Verify page title
    await assertElementExists(page, 'h1', { text: /assignments/i });
    
    // Verify create assignment button exists
    await assertElementExists(page, selectors.createAssignmentButton);
  });

  test('should create a new assignment', async ({ page }) => {
    // Click create assignment button
    await page.locator(selectors.createAssignmentButton).click();
    
    // Fill in assignment details
    const uniqueId = generateTestId();
    const assignmentName = `Test Assignment ${uniqueId}`;
    
    await page.locator(selectors.assignmentTitle).fill(assignmentName);
    await page.locator(selectors.assignmentDescription).fill('This is a test assignment created by automated testing');
    
    // Select a course (assuming there's at least one course available)
    await page.locator(selectors.courseSelect).selectOption({ index: 1 });
    
    // Set due date to 7 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const formattedDate = dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    await page.locator(selectors.dueDate).fill(formattedDate);
    
    // Set points
    await page.locator(selectors.assignmentPoints).fill('100');
    
    // Set status to draft initially
    await page.locator(selectors.assignmentStatus).selectOption('draft');
    
    // Save the assignment
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /created/i);
    
    // Verify assignment appears in the list
    await assertElementExists(page, selectors.assignmentItem, { text: assignmentName });
  });

  test('should edit an existing assignment', async ({ page }) => {
    // Find the first assignment and click edit
    await page.locator(`${selectors.assignmentItem} ${selectors.editButton}`).first().click();
    
    // Update assignment title
    const updatedTitle = `Updated Assignment ${generateTestId()}`;
    await page.locator(selectors.assignmentTitle).fill(updatedTitle);
    
    // Update points
    await page.locator(selectors.assignmentPoints).fill('75');
    
    // Save changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /updated/i);
    
    // Verify updated title appears
    await assertElementExists(page, selectors.assignmentItem, { text: updatedTitle });
  });

  test('should publish an assignment', async ({ page }) => {
    // Find the first assignment with "draft" status
    await page.locator(selectors.assignmentItem).filter({ hasText: 'draft' }).first().locator(selectors.editButton).click();
    
    // Change status to published
    await page.locator(selectors.assignmentStatus).selectOption('published');
    
    // Save changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /updated/i);
    
    // Verify assignment is now published
    await assertElementExists(page, selectors.assignmentItem, { text: 'published' });
  });

  test('should grade a student submission', async ({ page }) => {
    // Find an assignment with submissions and view it
    await page.locator(`${selectors.assignmentItem} ${selectors.viewButton}`).first().click();
    
    // Click on submissions tab
    await page.locator(selectors.submissionsTab).click();
    
    // Check if there are any submissions
    const hasSubmissions = await page.locator('table tbody tr').count() > 0;
    
    if (hasSubmissions) {
      // Click grade on the first submission
      await page.locator(selectors.gradeSubmissionButton).first().click();
      
      // Assign a grade
      await page.locator(selectors.gradeInput).fill('85');
      
      // Add feedback
      await page.locator(selectors.feedbackInput).fill('Good work! Consider improving the analysis section.');
      
      // Submit the grade
      await page.locator(selectors.submitGradeButton).click();
      
      // Wait for success notification
      await waitForNotification(page, /graded/i);
      
      // Verify submission shows as graded
      await assertElementExists(page, 'table tbody tr', { text: 'graded' });
    } else {
      // Skip test if no submissions are available
      test.skip('No submissions available to grade', () => {});
    }
  });

  test('should filter assignments by status', async ({ page }) => {
    // Get count of all assignments
    const initialCount = await page.locator(selectors.assignmentItem).count();
    
    // Select "published" status
    await page.locator(selectors.statusFilter).selectOption('published');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Get count of filtered assignments
    const filteredCount = await page.locator(selectors.assignmentItem).count();
    
    // Verify filtering worked (either fewer results or same if all were published)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // If there are results, verify they match the selected status
    if (filteredCount > 0) {
      await assertElementExists(page, selectors.assignmentItem, { text: 'published' });
    }
  });

  test('should filter assignments by course', async ({ page }) => {
    // Get count of all assignments
    const initialCount = await page.locator(selectors.assignmentItem).count();
    
    // Get first visible course name and select it in the filter
    const firstCourseName = await page.locator(`${selectors.assignmentItem} .course-name`).first().textContent();
    
    if (firstCourseName) {
      // Find the option with matching text
      await page.locator(selectors.courseFilter).selectOption({ label: firstCourseName.trim() });
      
      // Wait for filtered results
      await page.waitForTimeout(500);
      
      // Get count of filtered assignments
      const filteredCount = await page.locator(selectors.assignmentItem).count();
      
      // Verify filtering worked (either fewer results or same if all were for that course)
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      
      // If there are results, verify they match the selected course
      if (filteredCount > 0) {
        await assertElementExists(page, selectors.assignmentItem, { text: firstCourseName.trim() });
      }
    }
  });

  test('should search for assignments by title', async ({ page }) => {
    // Get first assignment title
    const firstAssignmentTitle = await page.locator(`${selectors.assignmentItem} h3`).first().textContent();
    const searchTerm = firstAssignmentTitle?.split(' ')[0] || '';
    
    // Search for the assignment
    await page.locator(selectors.searchInput).fill(searchTerm);
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify results contain the search term
    await assertElementExists(page, selectors.assignmentItem, { text: searchTerm });
  });

  test('should delete an assignment', async ({ page }) => {
    // Count initial number of assignments
    const initialCount = await page.locator(selectors.assignmentItem).count();
    
    // Find the first assignment and click delete
    await page.locator(`${selectors.assignmentItem} ${selectors.deleteButton}`).first().click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Wait for success notification
    await waitForNotification(page, /deleted/i);
    
    // Verify assignment count decreased
    await page.waitForTimeout(500);
    const newCount = await page.locator(selectors.assignmentItem).count();
    expect(newCount).toBeLessThan(initialCount);
  });
});