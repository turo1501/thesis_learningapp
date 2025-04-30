import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Read environment variables from .env.test
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Base URL to use in tests
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  // Directory where tests are located
  testDir: '../e2e',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: '../test-results/html' }],
    ['junit', { outputFile: '../test-results/junit/e2e-results.xml' }],
    ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL,
    
    // Record trace only on failure
    trace: 'on-first-retry',
    
    // Record video only on failure
    video: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Enable browsers to persist authentication between tests
    storageState: path.join(__dirname, '../e2e/storageState.json'),
  },
  
  // Configure projects for different browsers and viewport sizes
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, '../e2e/storageState.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: path.join(__dirname, '../e2e/storageState.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: path.join(__dirname, '../e2e/storageState.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: path.join(__dirname, '../e2e/storageState.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: path.join(__dirname, '../e2e/storageState.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'dashboard',
      testMatch: '**/*dashboard*/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, '../e2e/storageState.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'nondashboard',
      testMatch: '**/*nondashboard*/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
  ],
  
  // Local dev server options
  webServer: {
    command: 'cd ../client && npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});