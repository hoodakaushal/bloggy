import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // adjust path to your tests
  use: {
    baseURL: 'http://localhost:5173',
    
    // Take a screenshot only on failure
    screenshot: 'only-on-failure',

    // Keep traces for failed tests
    trace: 'retain-on-failure',
  },
  reporter: [
    ['list'], // console output
    ['html', { open: 'never' }] // generate HTML report, don't open automatically
  ],
});
