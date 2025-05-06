import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists, waitForNotification } from '../../utils/test-helpers';

test.describe('User Management (Admin)', () => {
  test.use({ storageState: 'e2e/storageState.admin.json' });
  
  // Common selectors for reuse
  const selectors = {
    userManagementContainer: '.user-management',
    usersTable: '[data-testid="users-table"]',
    userRow: '[data-testid="user-row"]',
    searchInput: '[data-testid="search-input"]',
    roleFilter: '[data-testid="role-filter"]',
    statusFilter: '[data-testid="status-filter"]',
    sortDropdown: '[data-testid="sort-dropdown"]',
    
    // Action buttons
    viewButton: '[data-testid="view-button"]',
    editButton: '[data-testid="edit-button"]',
    suspendButton: '[data-testid="suspend-button"]',
    unsuspendButton: '[data-testid="unsuspend-button"]',
    deleteButton: '[data-testid="delete-button"]',
    promoteButton: '[data-testid="promote-button"]',
    
    // Details panel
    userDetailsPanel: '.user-details-panel',
    userName: '[data-testid="user-name"]',
    userEmail: '[data-testid="user-email"]',
    userRole: '[data-testid="user-role"]',
    userStatus: '[data-testid="user-status"]',
    userJoinDate: '[data-testid="user-join-date"]',
    userLastLogin: '[data-testid="user-last-login"]',
    
    // Edit form
    editForm: '.user-edit-form',
    nameInput: '[data-testid="name-input"]',
    emailInput: '[data-testid="email-input"]',
    roleSelect: '[data-testid="role-select"]',
    statusSelect: '[data-testid="status-select"]',
    saveButton: 'button:has-text("Save")',
    cancelButton: 'button:has-text("Cancel")',
    
    // Confirmation dialogs
    confirmationDialog: '.confirmation-dialog',
    confirmButton: 'button:has-text("Confirm")',
    cancelDialogButton: 'button:has-text("Cancel")',
    
    // Activity section
    activityTab: '[data-testid="activity-tab"]',
    activityList: '[data-testid="activity-list"]',
    activityItem: '[data-testid="activity-item"]',
    
    // Enrollments section
    enrollmentsTab: '[data-testid="enrollments-tab"]',
    enrollmentsList: '[data-testid="enrollments-list"]',
    enrollmentItem: '[data-testid="enrollment-item"]',
    
    // Pagination
    paginationControls: '.pagination-controls',
    nextPageButton: 'button:has-text("Next")',
    previousPageButton: 'button:has-text("Previous")',
    pageNumbers: '.page-numbers',
    
    // Empty state
    emptyState: '.empty-state',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to admin user management
    await navigateTo(page, '/admin/users');
  });

  test('should display user management dashboard', async ({ page }) => {
    // Verify page title
    await assertElementExists(page, 'h1', { text: /user management/i });
    
    // Verify user management container exists
    await assertElementExists(page, selectors.userManagementContainer);
    
    // Verify users table exists
    await assertElementExists(page, selectors.usersTable);
    
    // Verify that users are displayed
    const userRowsCount = await page.locator(selectors.userRow).count();
    expect(userRowsCount).toBeGreaterThan(0);
    
    // Verify search input exists
    await assertElementExists(page, selectors.searchInput);
    
    // Verify filters exist
    await assertElementExists(page, selectors.roleFilter);
    await assertElementExists(page, selectors.statusFilter);
  });

  test('should search for users', async ({ page }) => {
    // Get initial count of users
    const initialCount = await page.locator(selectors.userRow).count();
    
    // Enter search term (common names to increase chances of finding a match)
    await page.locator(selectors.searchInput).fill('John');
    await page.keyboard.press('Enter');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check if user table still exists but potentially with different count
    await assertElementExists(page, selectors.usersTable);
    
    // Get updated count
    const searchResultCount = await page.locator(selectors.userRow).count();
    
    // Verify search results - either fewer results or specifically containing the search term
    if (searchResultCount > 0) {
      const firstRowText = await page.locator(selectors.userRow).first().textContent();
      if (firstRowText) {
        expect(firstRowText.toLowerCase()).toContain('john');
      }
    } else {
      // If no results, verify empty state is shown
      await assertElementExists(page, selectors.emptyState);
      await assertElementExists(page, 'text=No users found');
    }
    
    // Clear search
    await page.locator(selectors.searchInput).fill('');
    await page.keyboard.press('Enter');
    
    // Wait for results to reset
    await page.waitForTimeout(1000);
    
    // Verify users are displayed again
    const resetCount = await page.locator(selectors.userRow).count();
    expect(resetCount).toBeGreaterThan(0);
  });

  test('should filter users by role', async ({ page }) => {
    // Click on role filter
    await page.locator(selectors.roleFilter).click();
    
    // Select "Instructor" option
    await page.locator('text=Instructor').click();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if user table still exists
    await assertElementExists(page, selectors.usersTable);
    
    // Get user count after filtering
    const filteredCount = await page.locator(selectors.userRow).count();
    
    // If there are results, verify they have instructor role
    if (filteredCount > 0) {
      // Check if all visible users have "Instructor" role
      const roleCells = await page.locator(`${selectors.userRow} [data-testid="user-role-cell"]`).all();
      
      for (const cell of roleCells) {
        const roleText = await cell.textContent();
        if (roleText) {
          expect(roleText.toLowerCase()).toContain('instructor');
        }
      }
    } else {
      // If no results, verify empty state is shown
      await assertElementExists(page, selectors.emptyState);
      await assertElementExists(page, 'text=No instructors found');
    }
    
    // Reset filter by selecting "All"
    await page.locator(selectors.roleFilter).click();
    await page.locator('text=All').click();
    
    // Wait for filter to reset
    await page.waitForTimeout(1000);
    
    // Verify users are displayed again
    const resetCount = await page.locator(selectors.userRow).count();
    expect(resetCount).toBeGreaterThan(0);
  });

  test('should filter users by status', async ({ page }) => {
    // Click on status filter
    await page.locator(selectors.statusFilter).click();
    
    // Select "Active" option
    await page.locator('text=Active').click();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if user table still exists
    await assertElementExists(page, selectors.usersTable);
    
    // Get user count after filtering
    const filteredCount = await page.locator(selectors.userRow).count();
    
    // If there are results, verify they have active status
    if (filteredCount > 0) {
      // Check if all visible users have "Active" status
      const statusCells = await page.locator(`${selectors.userRow} [data-testid="user-status-cell"]`).all();
      
      for (const cell of statusCells) {
        const statusText = await cell.textContent();
        if (statusText) {
          expect(statusText.toLowerCase()).toContain('active');
        }
      }
    } else {
      // If no results, verify empty state is shown
      await assertElementExists(page, selectors.emptyState);
      await assertElementExists(page, 'text=No active users found');
    }
    
    // Reset filter by selecting "All"
    await page.locator(selectors.statusFilter).click();
    await page.locator('text=All').click();
    
    // Wait for filter to reset
    await page.waitForTimeout(1000);
    
    // Verify users are displayed again
    const resetCount = await page.locator(selectors.userRow).count();
    expect(resetCount).toBeGreaterThan(0);
  });

  test('should sort users', async ({ page }) => {
    // Click on the sort dropdown
    await page.locator(selectors.sortDropdown).click();
    
    // Select "Join Date" option
    await page.locator('text=Join Date').click();
    
    // Wait for sorting to apply
    await page.waitForTimeout(1000);
    
    // Check if user table still exists
    await assertElementExists(page, selectors.usersTable);
    
    // Get dates from the first few rows
    const dateElements = await page.locator(`${selectors.userRow} [data-testid="user-join-date-cell"]`).all();
    
    if (dateElements.length >= 2) {
      const firstDateText = await dateElements[0].textContent();
      const secondDateText = await dateElements[1].textContent();
      
      if (firstDateText && secondDateText) {
        const firstDate = new Date(firstDateText);
        const secondDate = new Date(secondDateText);
        
        // Verify that first date is more recent than or equal to second date
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    }
    
    // Now try a different sort option
    await page.locator(selectors.sortDropdown).click();
    
    // Select "Name" option
    await page.locator('text=Name').click();
    
    // Wait for sorting to apply
    await page.waitForTimeout(1000);
    
    // Check if user table still exists
    await assertElementExists(page, selectors.usersTable);
    
    // Get names from the first few rows
    const nameElements = await page.locator(`${selectors.userRow} [data-testid="user-name-cell"]`).all();
    
    if (nameElements.length >= 2) {
      const firstName = await nameElements[0].textContent();
      const secondName = await nameElements[1].textContent();
      
      if (firstName && secondName) {
        // Names should be in alphabetical order
        expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
      }
    }
  });

  test('should view user details', async ({ page }) => {
    // Click on the view button for the first user
    await page.locator(selectors.viewButton).first().click();
    
    // Wait for details panel to open
    await page.waitForTimeout(500);
    
    // Verify details panel exists
    await assertElementExists(page, selectors.userDetailsPanel);
    
    // Verify core user information is displayed
    await assertElementExists(page, selectors.userName);
    await assertElementExists(page, selectors.userEmail);
    await assertElementExists(page, selectors.userRole);
    await assertElementExists(page, selectors.userStatus);
    
    // Verify additional information is displayed
    await assertElementExists(page, selectors.userJoinDate);
    await assertElementExists(page, selectors.userLastLogin);
    
    // If there's an activity tab, verify it works
    const activityTab = page.locator(selectors.activityTab);
    if (await activityTab.isVisible()) {
      await activityTab.click();
      await page.waitForTimeout(500);
      await assertElementExists(page, selectors.activityList);
    }
    
    // If there's an enrollments tab, verify it works
    const enrollmentsTab = page.locator(selectors.enrollmentsTab);
    if (await enrollmentsTab.isVisible()) {
      await enrollmentsTab.click();
      await page.waitForTimeout(500);
      await assertElementExists(page, selectors.enrollmentsList);
    }
    
    // Close details panel if there's a close button
    const closeButton = page.locator('button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Verify panel is closed
      expect(await page.locator(selectors.userDetailsPanel).isVisible()).toBeFalsy();
    }
  });

  test('should edit user details', async ({ page }) => {
    // Click on the edit button for the first user
    await page.locator(selectors.editButton).first().click();
    
    // Wait for edit form to open
    await page.waitForTimeout(500);
    
    // Verify edit form exists
    await assertElementExists(page, selectors.editForm);
    
    // Get original name
    const originalName = await page.locator(selectors.nameInput).inputValue();
    
    // Edit the name
    const newName = `${originalName} (Updated)`;
    await page.locator(selectors.nameInput).fill(newName);
    
    // Save changes
    await page.locator(selectors.saveButton).click();
    
    // Wait for success notification
    await waitForNotification(page, "user updated");
    
    // Verify edit form is closed
    expect(await page.locator(selectors.editForm).isVisible()).toBeFalsy();
    
    // Navigate to view the user details to verify changes
    await page.locator(selectors.viewButton).first().click();
    
    // Wait for details panel to open
    await page.waitForTimeout(500);
    
    // Verify name has been updated
    const updatedName = await page.locator(selectors.userName).textContent();
    expect(updatedName).toContain('Updated');
  });

  test('should suspend and unsuspend a user', async ({ page }) => {
    // Find a user with a suspend button
    const suspendButton = page.locator(selectors.suspendButton).first();
    const unsuspendButton = page.locator(selectors.unsuspendButton).first();
    
    // Determine whether to suspend or unsuspend based on which button is visible
    if (await suspendButton.isVisible()) {
      // Get the user name before suspending
      const userNameElement = page.locator(`${selectors.userRow}:has(${selectors.suspendButton}) [data-testid="user-name-cell"]`).first();
      const userName = await userNameElement.textContent();
      
      if (!userName) {
        test.skip('Could not get user name for suspend test', () => {});
        return;
      }
      
      // Suspend the user
      await suspendButton.click();
      
      // Confirm suspension in dialog
      await page.locator(selectors.confirmButton).click();
      
      // Wait for success notification
      await waitForNotification(page, "user suspended");
      
      // Filter to show suspended users
      await page.locator(selectors.statusFilter).click();
      await page.locator('text=Suspended').click();
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Verify the suspended user is in the list
      const suspendedUserExists = await page.locator(`${selectors.userRow} :text("${userName}")`).isVisible();
      expect(suspendedUserExists).toBeTruthy();
      
      // Find the unsuspend button for the suspended user
      const userUnsuspendButton = page.locator(`${selectors.userRow}:has-text("${userName}") ${selectors.unsuspendButton}`);
      
      if (await userUnsuspendButton.isVisible()) {
        // Unsuspend the user
        await userUnsuspendButton.click();
        
        // Confirm unsuspension in dialog
        await page.locator(selectors.confirmButton).click();
        
        // Wait for success notification
        await waitForNotification(page, "user unsuspended");
        
        // Filter to show active users
        await page.locator(selectors.statusFilter).click();
        await page.locator('text=Active').click();
        
        // Wait for filter to apply
        await page.waitForTimeout(1000);
        
        // Verify the unsuspended user is in the active list
        const activeUserExists = await page.locator(`${selectors.userRow} :text("${userName}")`).isVisible();
        expect(activeUserExists).toBeTruthy();
      }
    } else if (await unsuspendButton.isVisible()) {
      // If unsuspend button is visible, test unsuspending a user
      const userNameElement = page.locator(`${selectors.userRow}:has(${selectors.unsuspendButton}) [data-testid="user-name-cell"]`).first();
      const userName = await userNameElement.textContent();
      
      if (!userName) {
        test.skip('Could not get user name for unsuspend test', () => {});
        return;
      }
      
      // Unsuspend the user
      await unsuspendButton.click();
      
      // Confirm unsuspension in dialog
      await page.locator(selectors.confirmButton).click();
      
      // Wait for success notification
      await waitForNotification(page, "user unsuspended");
      
      // Filter to show active users
      await page.locator(selectors.statusFilter).click();
      await page.locator('text=Active').click();
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Verify the unsuspended user is in the active list
      const activeUserExists = await page.locator(`${selectors.userRow} :text("${userName}")`).isVisible();
      expect(activeUserExists).toBeTruthy();
    } else {
      // Skip test if neither button is found
      test.skip('No suspend/unsuspend buttons found', () => {});
    }
  });

  test('should promote a user to instructor', async ({ page }) => {
    // Filter to show only students
    await page.locator(selectors.roleFilter).click();
    await page.locator('text=Student').click();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if there are any students
    const studentCount = await page.locator(selectors.userRow).count();
    
    if (studentCount > 0) {
      // Find a student with a promote button
      const promoteButton = page.locator(selectors.promoteButton).first();
      
      if (await promoteButton.isVisible()) {
        // Get the student name before promoting
        const studentNameElement = page.locator(`${selectors.userRow}:has(${selectors.promoteButton}) [data-testid="user-name-cell"]`).first();
        const studentName = await studentNameElement.textContent();
        
        if (!studentName) {
          test.skip('Could not get student name for promotion test', () => {});
          return;
        }
        
        // Promote the student
        await promoteButton.click();
        
        // Confirm promotion in dialog
        await page.locator(selectors.confirmButton).click();
        
        // Wait for success notification
        await waitForNotification(page, "user promoted");
        
        // Filter to show instructors
        await page.locator(selectors.roleFilter).click();
        await page.locator('text=Instructor').click();
        
        // Wait for filter to apply
        await page.waitForTimeout(1000);
        
        // Verify the promoted user is in the instructors list
        const promotedUserExists = await page.locator(`${selectors.userRow} :text("${studentName}")`).isVisible();
        expect(promotedUserExists).toBeTruthy();
      } else {
        // Skip test if no promote button is found
        test.skip('No promote button found on student accounts', () => {});
      }
    } else {
      // Skip test if no students
      test.skip('No student accounts available to promote', () => {});
    }
  });

  test('should paginate through users', async ({ page }) => {
    // Check if pagination controls exist
    const paginationExists = await page.locator(selectors.paginationControls).isVisible();
    
    if (paginationExists) {
      // Get text of first user on first page
      const firstPageUserText = await page.locator(selectors.userRow).first().textContent();
      
      // Click on next page button
      await page.locator(selectors.nextPageButton).click();
      
      // Wait for page to load
      await page.waitForTimeout(1000);
      
      // Get text of first user on second page
      const secondPageUserText = await page.locator(selectors.userRow).first().textContent();
      
      // Verify users are different between pages
      expect(firstPageUserText).not.toEqual(secondPageUserText);
      
      // Go back to first page
      await page.locator(selectors.previousPageButton).click();
      
      // Wait for page to load
      await page.waitForTimeout(1000);
      
      // Verify we're back to the first page
      const backToFirstPageText = await page.locator(selectors.userRow).first().textContent();
      expect(backToFirstPageText).toEqual(firstPageUserText);
    } else {
      // Skip test if pagination is not available
      test.skip('Pagination controls not found', () => {});
    }
  });
  
  test('should handle user deletion process', async ({ page }) => {
    // Search for a test user that can be deleted
    await page.locator(selectors.searchInput).fill('test-deletable-user');
    await page.keyboard.press('Enter');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check if we found a deletable test user
    const userFound = await page.locator(selectors.userRow).count() > 0;
    
    if (userFound) {
      // Get the user name before deleting
      const userNameElement = page.locator(`${selectors.userRow} [data-testid="user-name-cell"]`).first();
      const userName = await userNameElement.textContent();
      
      if (!userName) {
        test.skip('Could not get user name for deletion test', () => {});
        return;
      }
      
      // Click delete button
      await page.locator(selectors.deleteButton).first().click();
      
      // Verify confirmation dialog appears
      await assertElementExists(page, selectors.confirmationDialog);
      await assertElementExists(page, 'text=Confirm deletion');
      
      // Confirm deletion
      await page.locator(selectors.confirmButton).click();
      
      // Wait for success notification
      await waitForNotification(page, "user deleted");
      
      // Verify user is no longer in the list
      const userStillExists = await page.locator(`${selectors.userRow} :text("${userName}")`).isVisible();
      expect(userStillExists).toBeFalsy();
    } else {
      // Skip test if no deletable test user found
      test.skip('No deletable test user found', () => {});
    }
  });
});