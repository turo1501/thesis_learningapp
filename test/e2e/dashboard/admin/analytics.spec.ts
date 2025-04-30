import { test, expect } from '@playwright/test';
import { navigateTo, assertElementExists, waitForNotification } from '../../utils/test-helpers';

test.describe('Analytics Dashboard (Admin)', () => {
  test.use({ storageState: 'e2e/storageState.admin.json' });
  
  // Common selectors for reuse
  const selectors = {
    analyticsContainer: '.analytics-dashboard',
    summaryCards: '.summary-card',
    userStatsCard: '.user-stats-card',
    courseStatsCard: '.course-stats-card',
    revenueStatsCard: '.revenue-stats-card',
    engagementStatsCard: '.engagement-stats-card',
    
    usersGraph: '[data-testid="users-graph"]',
    coursesGraph: '[data-testid="courses-graph"]',
    revenueGraph: '[data-testid="revenue-graph"]',
    engagementGraph: '[data-testid="engagement-graph"]',
    
    dateRangeSelector: '[data-testid="date-range-selector"]',
    datePicker: '[data-testid="date-picker"]',
    rangeButtons: {
      week: 'button:has-text("Week")',
      month: 'button:has-text("Month")',
      quarter: 'button:has-text("Quarter")',
      year: 'button:has-text("Year")',
      all: 'button:has-text("All")',
    },
    
    exportButton: 'button:has-text("Export")',
    printButton: 'button:has-text("Print")',
    refreshButton: 'button:has-text("Refresh")',
    
    tabButtons: {
      overview: 'button:has-text("Overview")',
      users: 'button:has-text("Users")',
      courses: 'button:has-text("Courses")',
      revenue: 'button:has-text("Revenue")',
      engagement: 'button:has-text("Engagement")',
    },
    
    dataTable: '.data-table',
    tableRows: '.data-table tbody tr',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to admin analytics dashboard
    await navigateTo(page, '/admin/analytics');
  });

  test('should display analytics dashboard with summary cards', async ({ page }) => {
    // Verify page title
    await assertElementExists(page, 'h1', { text: /analytics dashboard/i });
    
    // Verify analytics container exists
    await assertElementExists(page, selectors.analyticsContainer);
    
    // Verify summary cards exist
    const summaryCardsCount = await page.locator(selectors.summaryCards).count();
    expect(summaryCardsCount).toBeGreaterThan(0);
    
    // Verify individual statistic cards
    await assertElementExists(page, selectors.userStatsCard);
    await assertElementExists(page, selectors.courseStatsCard);
    await assertElementExists(page, selectors.revenueStatsCard);
    await assertElementExists(page, selectors.engagementStatsCard);
  });

  test('should display graphs for different metrics', async ({ page }) => {
    // Verify various graphs are displayed
    await assertElementExists(page, selectors.usersGraph);
    await assertElementExists(page, selectors.coursesGraph);
    await assertElementExists(page, selectors.revenueGraph);
    await assertElementExists(page, selectors.engagementGraph);
  });

  test('should filter analytics by date range', async ({ page }) => {
    // Click on date range selector
    await page.locator(selectors.dateRangeSelector).click();
    
    // Select a different date range (month)
    await page.locator(selectors.rangeButtons.month).click();
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify data has been updated (checking if graphs still exist)
    await assertElementExists(page, selectors.usersGraph);
    
    // Verify month indicator is present somewhere on the page
    await assertElementExists(page, 'text=/last month|30 days|monthly/i');
    
    // Select custom date range if available
    const hasDatePicker = await page.locator(selectors.datePicker).isVisible();
    if (hasDatePicker) {
      await page.locator(selectors.datePicker).click();
      
      // This is a simplified approach. In a real test, you'd need to interact with
      // the specific date picker implementation
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      // Select start date (simplified - actual implementation depends on date picker component)
      await page.locator('button.startDate').click();
      
      // Select end date (simplified)
      await page.locator('button.endDate').click();
      
      // Apply date range
      await page.locator('button:has-text("Apply")').click();
      
      // Wait for data to reload
      await page.waitForTimeout(1000);
      
      // Verify data has been updated
      await assertElementExists(page, selectors.usersGraph);
    }
  });

  test('should switch between analytics tabs', async ({ page }) => {
    // Navigate to Users tab
    await page.locator(selectors.tabButtons.users).click();
    
    // Verify users-specific content is displayed
    await assertElementExists(page, 'h2', { text: /user analytics/i });
    await assertElementExists(page, 'text=/new users|active users|user growth/i');
    
    // Navigate to Courses tab
    await page.locator(selectors.tabButtons.courses).click();
    
    // Verify courses-specific content is displayed
    await assertElementExists(page, 'h2', { text: /course analytics/i });
    await assertElementExists(page, 'text=/course creation|popular courses|course completion/i');
    
    // Navigate to Revenue tab
    await page.locator(selectors.tabButtons.revenue).click();
    
    // Verify revenue-specific content is displayed
    await assertElementExists(page, 'h2', { text: /revenue analytics/i });
    await assertElementExists(page, 'text=/total revenue|average transaction|payment method/i');
    
    // Navigate to Engagement tab
    await page.locator(selectors.tabButtons.engagement).click();
    
    // Verify engagement-specific content is displayed
    await assertElementExists(page, 'h2', { text: /engagement analytics/i });
    await assertElementExists(page, 'text=/session duration|average time|completion rate/i');
    
    // Navigate back to Overview tab
    await page.locator(selectors.tabButtons.overview).click();
    
    // Verify overview content is displayed again
    await assertElementExists(page, selectors.usersGraph);
    await assertElementExists(page, selectors.courseStatsCard);
  });

  test('should export analytics data', async ({ page }) => {
    // Check if export button exists
    const hasExportButton = await page.locator(selectors.exportButton).isVisible();
    
    if (hasExportButton) {
      // Click on export button
      await page.locator(selectors.exportButton).click();
      
      // Check if export options appear
      await assertElementExists(page, 'text=/csv|excel|pdf/i');
      
      // Select CSV export option (assuming it exists)
      await page.locator('button:has-text("CSV")').click();
      
      // Wait for download to be initiated (simplified)
      // In a real test, you'd use Playwright's download handler
      await page.waitForTimeout(1000);
      
      // Verify success notification
      await waitForNotification(page, /export started|download ready/i);
    } else {
      // Skip test if export button is not available
      test.skip('Export functionality not available', () => {});
    }
  });

  test('should refresh analytics data', async ({ page }) => {
    // Click refresh button
    await page.locator(selectors.refreshButton).click();
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify data has been updated (checking if graphs still exist)
    await assertElementExists(page, selectors.usersGraph);
    
    // Verify refresh indication (such as a success message or last updated timestamp)
    await assertElementExists(page, 'text=/refreshed|updated|last update/i');
  });

  test('should display data tables with sortable columns', async ({ page }) => {
    // Check if data table exists
    const hasDataTable = await page.locator(selectors.dataTable).isVisible();
    
    if (hasDataTable) {
      // Get initial data from first row
      const initialFirstRowText = await page.locator(selectors.tableRows).first().textContent();
      
      // Click on a column header to sort (assuming first column is sortable)
      await page.locator(`${selectors.dataTable} th`).first().click();
      
      // Wait for sorting to complete
      await page.waitForTimeout(500);
      
      // Get sorted data from first row
      const sortedFirstRowText = await page.locator(selectors.tableRows).first().textContent();
      
      // Compare - they might be the same or different depending on current sort
      // This is a simple check that the sort action completed, not that it sorted correctly
      expect(initialFirstRowText).toBeDefined();
      expect(sortedFirstRowText).toBeDefined();
      
      // Click again to reverse sort
      await page.locator(`${selectors.dataTable} th`).first().click();
      
      // Wait for sorting to complete
      await page.waitForTimeout(500);
      
      // Get reversed sort data from first row
      const reverseSortedFirstRowText = await page.locator(selectors.tableRows).first().textContent();
      
      // Verify that either the initial or sorted text differs from the reverse sorted text
      // This ensures that at least one sort operation changed the order
      expect(
        initialFirstRowText !== reverseSortedFirstRowText || 
        sortedFirstRowText !== reverseSortedFirstRowText
      ).toBeTruthy();
    } else {
      // Skip test if data table is not available
      test.skip('Sortable data table not available', () => {});
    }
  });

  test('should display user growth trends correctly', async ({ page }) => {
    // Navigate to Users tab
    await page.locator(selectors.tabButtons.users).click();
    
    // Verify users graph is displayed
    await assertElementExists(page, selectors.usersGraph);
    
    // Check graph elements (bars, lines, or points)
    const graphElementsExist = await page.locator(`${selectors.usersGraph} path, ${selectors.usersGraph} rect`).count() > 0;
    expect(graphElementsExist).toBeTruthy();
    
    // Check for labels and legends
    await assertElementExists(page, 'text=/new users|active users|total users/i');
  });

  test('should display revenue metrics correctly', async ({ page }) => {
    // Navigate to Revenue tab
    await page.locator(selectors.tabButtons.revenue).click();
    
    // Verify revenue graph is displayed
    await assertElementExists(page, selectors.revenueGraph);
    
    // Check revenue summary metrics
    await assertElementExists(page, 'text=/total revenue|average revenue|revenue growth/i');
    
    // Check currency symbols are present for monetary values
    await assertElementExists(page, 'text=/\$|€|£|¥/');
  });
});