import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists, waitForNotification } from '../../utils/test-helpers';

test.describe('Course Management (Admin)', () => {
  test.use({ storageState: 'e2e/storageState.admin.json' });
  
  // Common selectors for reuse
  const selectors = {
    courseManagementContainer: '.course-management',
    coursesTable: '[data-testid="courses-table"]',
    courseRow: '[data-testid="course-row"]',
    searchInput: '[data-testid="search-input"]',
    statusFilter: '[data-testid="status-filter"]',
    categoryFilter: '[data-testid="category-filter"]',
    sortDropdown: '[data-testid="sort-dropdown"]',
    
    // Action buttons
    viewButton: '[data-testid="view-button"]',
    editButton: '[data-testid="edit-button"]',
    approveButton: '[data-testid="approve-button"]',
    rejectButton: '[data-testid="reject-button"]',
    featureButton: '[data-testid="feature-button"]',
    unfeatureButton: '[data-testid="unfeature-button"]',
    archiveButton: '[data-testid="archive-button"]',
    restoreButton: '[data-testid="restore-button"]',
    
    // Details panel
    courseDetailsPanel: '.course-details-panel',
    courseTitle: '[data-testid="course-title"]',
    courseDescription: '[data-testid="course-description"]',
    courseInstructor: '[data-testid="course-instructor"]',
    courseCategory: '[data-testid="course-category"]',
    courseStatus: '[data-testid="course-status"]',
    courseRating: '[data-testid="course-rating"]',
    courseEnrollments: '[data-testid="course-enrollments"]',
    courseRevenue: '[data-testid="course-revenue"]',
    courseCreatedAt: '[data-testid="course-created-at"]',
    courseUpdatedAt: '[data-testid="course-updated-at"]',
    
    // Edit form
    editForm: '.course-edit-form',
    titleInput: '[data-testid="title-input"]',
    descriptionInput: '[data-testid="description-input"]',
    categorySelect: '[data-testid="category-select"]',
    priceInput: '[data-testid="price-input"]',
    saveButton: 'button:has-text("Save")',
    cancelButton: 'button:has-text("Cancel")',
    
    // Approve/Reject dialog
    approveRejectDialog: '.approve-reject-dialog',
    feedbackInput: '[data-testid="feedback-input"]',
    confirmButton: 'button:has-text("Confirm")',
    
    // Pagination
    paginationControls: '.pagination-controls',
    nextPageButton: 'button:has-text("Next")',
    previousPageButton: 'button:has-text("Previous")',
    pageNumbers: '.page-numbers',
    
    // Empty state
    emptyState: '.empty-state',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to admin course management
    await navigateTo(page, '/admin/courses');
  });

  test('should display course management dashboard', async ({ page }) => {
    // Verify page title
    await assertElementExists(page, 'h1', { text: /course management/i });
    
    // Verify course management container exists
    await assertElementExists(page, selectors.courseManagementContainer);
    
    // Verify courses table exists
    await assertElementExists(page, selectors.coursesTable);
    
    // Verify that courses are displayed
    const courseRowsCount = await page.locator(selectors.courseRow).count();
    expect(courseRowsCount).toBeGreaterThan(0);
    
    // Verify search input exists
    await assertElementExists(page, selectors.searchInput);
    
    // Verify filters exist
    await assertElementExists(page, selectors.statusFilter);
    await assertElementExists(page, selectors.categoryFilter);
  });

  test('should search for courses', async ({ page }) => {
    // Get initial count of courses
    const initialCount = await page.locator(selectors.courseRow).count();
    
    // Enter search term
    await page.locator(selectors.searchInput).fill('JavaScript');
    await page.keyboard.press('Enter');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check if course table still exists but potentially with different count
    await assertElementExists(page, selectors.coursesTable);
    
    // Get updated count
    const searchResultCount = await page.locator(selectors.courseRow).count();
    
    // Verify search results - either fewer results or specifically containing the search term
    if (searchResultCount > 0) {
      const firstRowText = await page.locator(selectors.courseRow).first().textContent();
      expect(firstRowText.toLowerCase()).toContain('javascript');
    } else {
      // If no results, verify empty state is shown
      await assertElementExists(page, selectors.emptyState);
      await assertElementExists(page, 'text=/no courses found|no matching courses/i');
    }
    
    // Clear search
    await page.locator(selectors.searchInput).fill('');
    await page.keyboard.press('Enter');
    
    // Wait for results to reset
    await page.waitForTimeout(1000);
    
    // Verify courses are displayed again
    const resetCount = await page.locator(selectors.courseRow).count();
    expect(resetCount).toBeGreaterThan(0);
  });

  test('should filter courses by status', async ({ page }) => {
    // Click on status filter
    await page.locator(selectors.statusFilter).click();
    
    // Select "Pending Approval" option
    await page.locator('text=Pending Approval').click();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if course table still exists
    await assertElementExists(page, selectors.coursesTable);
    
    // Get course count after filtering
    const filteredCount = await page.locator(selectors.courseRow).count();
    
    // If there are results, verify they have pending status
    if (filteredCount > 0) {
      // Check if all visible courses have "Pending" status
      const statusCells = await page.locator(`${selectors.courseRow} [data-testid="course-status-cell"]`).all();
      
      for (const cell of statusCells) {
        const statusText = await cell.textContent();
        expect(statusText.toLowerCase()).toContain('pending');
      }
    } else {
      // If no results, verify empty state is shown
      await assertElementExists(page, selectors.emptyState);
      await assertElementExists(page, 'text=/no pending courses|no courses pending approval/i');
    }
    
    // Reset filter by selecting "All"
    await page.locator(selectors.statusFilter).click();
    await page.locator('text=All').click();
    
    // Wait for filter to reset
    await page.waitForTimeout(1000);
    
    // Verify courses are displayed again
    const resetCount = await page.locator(selectors.courseRow).count();
    expect(resetCount).toBeGreaterThan(0);
  });

  test('should filter courses by category', async ({ page }) => {
    // Click on category filter
    await page.locator(selectors.categoryFilter).click();
    
    // Get available categories and select the first one
    const categoryOptions = await page.locator('role=option').all();
    if (categoryOptions.length > 1) {
      const categoryText = await categoryOptions[1].textContent(); // First one after "All"
      await categoryOptions[1].click();
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Check if course table still exists
      await assertElementExists(page, selectors.coursesTable);
      
      // Get course count after filtering
      const filteredCount = await page.locator(selectors.courseRow).count();
      
      // If there are results, verify they're in the selected category
      if (filteredCount > 0) {
        const categoryCells = await page.locator(`${selectors.courseRow} [data-testid="course-category-cell"]`).all();
        
        for (const cell of categoryCells) {
          const cellText = await cell.textContent();
          expect(cellText).toContain(categoryText);
        }
      } else {
        // If no results, verify empty state is shown
        await assertElementExists(page, selectors.emptyState);
        await assertElementExists(page, 'text=/no courses in this category/i');
      }
      
      // Reset filter
      await page.locator(selectors.categoryFilter).click();
      await page.locator('text=All').click();
      
      // Wait for filter to reset
      await page.waitForTimeout(1000);
      
      // Verify courses are displayed again
      const resetCount = await page.locator(selectors.courseRow).count();
      expect(resetCount).toBeGreaterThan(0);
    }
  });

  test('should sort courses', async ({ page }) => {
    // Click on the sort dropdown
    await page.locator(selectors.sortDropdown).click();
    
    // Select "Newest First" option
    await page.locator('text=Newest First').click();
    
    // Wait for sorting to apply
    await page.waitForTimeout(1000);
    
    // Check if course table still exists
    await assertElementExists(page, selectors.coursesTable);
    
    // Get dates from the first few rows
    const dateElements = await page.locator(`${selectors.courseRow} [data-testid="course-date-cell"]`).all();
    
    if (dateElements.length >= 2) {
      const firstDate = new Date(await dateElements[0].textContent());
      const secondDate = new Date(await dateElements[1].textContent());
      
      // Verify that first date is equal or newer than second date
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
    }
    
    // Now try a different sort option
    await page.locator(selectors.sortDropdown).click();
    
    // Select "Most Popular" option
    await page.locator('text=Most Popular').click();
    
    // Wait for sorting to apply
    await page.waitForTimeout(1000);
    
    // Check if course table still exists
    await assertElementExists(page, selectors.coursesTable);
    
    // Get enrollment counts from the first few rows
    const enrollmentElements = await page.locator(`${selectors.courseRow} [data-testid="course-enrollments-cell"]`).all();
    
    if (enrollmentElements.length >= 2) {
      const firstEnrollments = parseInt(await enrollmentElements[0].textContent());
      const secondEnrollments = parseInt(await enrollmentElements[1].textContent());
      
      // Verify that first enrollment count is greater than or equal to second
      expect(firstEnrollments).toBeGreaterThanOrEqual(secondEnrollments);
    }
  });

  test('should view course details', async ({ page }) => {
    // Click on the view button for the first course
    await page.locator(selectors.viewButton).first().click();
    
    // Wait for details panel to open
    await page.waitForTimeout(500);
    
    // Verify details panel exists
    await assertElementExists(page, selectors.courseDetailsPanel);
    
    // Verify core course information is displayed
    await assertElementExists(page, selectors.courseTitle);
    await assertElementExists(page, selectors.courseDescription);
    await assertElementExists(page, selectors.courseInstructor);
    await assertElementExists(page, selectors.courseCategory);
    await assertElementExists(page, selectors.courseStatus);
    
    // Verify additional metrics are displayed
    await assertElementExists(page, selectors.courseRating);
    await assertElementExists(page, selectors.courseEnrollments);
    await assertElementExists(page, selectors.courseRevenue);
    
    // Verify timestamps are displayed
    await assertElementExists(page, selectors.courseCreatedAt);
    await assertElementExists(page, selectors.courseUpdatedAt);
    
    // Close details panel if there's a close button
    const closeButton = page.locator('button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Verify panel is closed
      expect(await page.locator(selectors.courseDetailsPanel).isVisible()).toBeFalsy();
    }
  });

  test('should edit course details', async ({ page }) => {
    // Click on the edit button for the first course
    await page.locator(selectors.editButton).first().click();
    
    // Wait for edit form to open
    await page.waitForTimeout(500);
    
    // Verify edit form exists
    await assertElementExists(page, selectors.editForm);
    
    // Get original title
    const originalTitle = await page.locator(selectors.titleInput).inputValue();
    
    // Edit the title
    const newTitle = `${originalTitle} (Updated)`;
    await page.locator(selectors.titleInput).fill(newTitle);
    
    // Edit description
    const originalDescription = await page.locator(selectors.descriptionInput).inputValue();
    const newDescription = `${originalDescription} - Updated by admin.`;
    await page.locator(selectors.descriptionInput).fill(newDescription);
    
    // Save changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, /course updated|changes saved/i);
    
    // Verify edit form is closed
    expect(await page.locator(selectors.editForm).isVisible()).toBeFalsy();
    
    // Navigate to view the course details to verify changes
    await page.locator(selectors.viewButton).first().click();
    
    // Wait for details panel to open
    await page.waitForTimeout(500);
    
    // Verify title and description have been updated
    const updatedTitle = await page.locator(selectors.courseTitle).textContent();
    expect(updatedTitle).toContain('Updated');
    
    const updatedDescription = await page.locator(selectors.courseDescription).textContent();
    expect(updatedDescription).toContain('Updated by admin');
  });

  test('should approve a pending course', async ({ page }) => {
    // Filter to show only pending courses
    await page.locator(selectors.statusFilter).click();
    await page.locator('text=Pending Approval').click();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if there are any pending courses
    const pendingCoursesCount = await page.locator(selectors.courseRow).count();
    
    if (pendingCoursesCount > 0) {
      // Click on the approve button for the first pending course
      await page.locator(selectors.approveButton).first().click();
      
      // Wait for approval dialog to open
      await page.waitForTimeout(500);
      
      // Verify approval dialog exists
      await assertElementExists(page, selectors.approveRejectDialog);
      
      // Enter feedback
      await page.locator(selectors.feedbackInput).fill('Course content meets our standards. Approved.');
      
      // Confirm approval
      await page.locator(selectors.confirmButton).click();
      
      // Wait for success notification
      await waitForNotification(page, /course approved|approval successful/i);
      
      // Verify the course is no longer in the pending list
      const updatedPendingCount = await page.locator(selectors.courseRow).count();
      expect(updatedPendingCount).toBeLessThan(pendingCoursesCount);
    } else {
      // Skip test if no pending courses
      test.skip('No pending courses to approve', () => {});
    }
  });

  test('should feature and unfeature a course', async ({ page }) => {
    // Check if there are any published courses
    const coursesCount = await page.locator(selectors.courseRow).count();
    
    if (coursesCount > 0) {
      // Find a course with a feature button
      const featureButton = page.locator(selectors.featureButton).first();
      const unfeatureButton = page.locator(selectors.unfeatureButton).first();
      
      // Determine whether to feature or unfeature based on which button is visible
      if (await featureButton.isVisible()) {
        // Feature the course
        await featureButton.click();
        
        // Wait for success notification
        await waitForNotification(page, /course featured|featured successfully/i);
        
        // Verify the feature button is replaced with unfeature button
        expect(await unfeatureButton.isVisible()).toBeTruthy();
      } else if (await unfeatureButton.isVisible()) {
        // Unfeature the course
        await unfeatureButton.click();
        
        // Wait for success notification
        await waitForNotification(page, /course unfeatured|removed from featured/i);
        
        // Verify the unfeature button is replaced with feature button
        expect(await featureButton.isVisible()).toBeTruthy();
      } else {
        // Skip test if neither button is found
        test.skip('No feature/unfeature buttons found', () => {});
      }
    } else {
      // Skip test if no courses
      test.skip('No courses available to feature/unfeature', () => {});
    }
  });

  test('should archive and restore a course', async ({ page }) => {
    // Check if there are any active courses
    const coursesCount = await page.locator(selectors.courseRow).count();
    
    if (coursesCount > 0) {
      // Find a course with an archive button
      const archiveButton = page.locator(selectors.archiveButton).first();
      
      if (await archiveButton.isVisible()) {
        // Get the course title before archiving
        const courseTitle = await page.locator(`${selectors.courseRow}:has(${selectors.archiveButton}) [data-testid="course-title-cell"]`).first().textContent();
        
        // Archive the course
        await archiveButton.click();
        
        // Confirm archive action if dialog appears
        const confirmDialog = page.locator('text=/are you sure|confirm archive/i');
        if (await confirmDialog.isVisible()) {
          await page.locator('button:has-text("Confirm")').click();
        }
        
        // Wait for success notification
        await waitForNotification(page, /course archived|archive successful/i);
        
        // Filter to show archived courses
        await page.locator(selectors.statusFilter).click();
        await page.locator('text=Archived').click();
        
        // Wait for filter to apply
        await page.waitForTimeout(1000);
        
        // Verify the archived course is in the list
        const archivedCourseExists = await page.locator(`${selectors.courseRow} :text("${courseTitle}")`).isVisible();
        expect(archivedCourseExists).toBeTruthy();
        
        // Find the restore button for the archived course
        const restoreButton = page.locator(selectors.restoreButton).first();
        
        if (await restoreButton.isVisible()) {
          // Restore the course
          await restoreButton.click();
          
          // Wait for success notification
          await waitForNotification(page, /course restored|restore successful/i);
          
          // Filter to show active courses
          await page.locator(selectors.statusFilter).click();
          await page.locator('text=Active').click();
          
          // Wait for filter to apply
          await page.waitForTimeout(1000);
          
          // Verify the restored course is in the active list
          const restoredCourseExists = await page.locator(`${selectors.courseRow} :text("${courseTitle}")`).isVisible();
          expect(restoredCourseExists).toBeTruthy();
        }
      } else {
        // Skip test if no archive button is found
        test.skip('No archive button found', () => {});
      }
    } else {
      // Skip test if no courses
      test.skip('No courses available to archive/restore', () => {});
    }
  });

  test('should paginate through courses', async ({ page }) => {
    // Check if pagination controls exist
    const paginationExists = await page.locator(selectors.paginationControls).isVisible();
    
    if (paginationExists) {
      // Get text of first course on first page
      const firstPageCourseText = await page.locator(selectors.courseRow).first().textContent();
      
      // Click on next page button
      await page.locator(selectors.nextPageButton).click();
      
      // Wait for page to load
      await page.waitForTimeout(1000);
      
      // Get text of first course on second page
      const secondPageCourseText = await page.locator(selectors.courseRow).first().textContent();
      
      // Verify courses are different between pages
      expect(firstPageCourseText).not.toEqual(secondPageCourseText);
      
      // Go back to first page
      await page.locator(selectors.previousPageButton).click();
      
      // Wait for page to load
      await page.waitForTimeout(1000);
      
      // Verify we're back to the first page
      const backToFirstPageText = await page.locator(selectors.courseRow).first().textContent();
      expect(backToFirstPageText).toEqual(firstPageCourseText);
    } else {
      // Skip test if pagination is not available
      test.skip('Pagination controls not found', () => {});
    }
  });
});