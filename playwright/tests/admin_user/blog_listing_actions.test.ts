import { test, expect } from '@playwright/test';
import {
  getCurrentPageNumber,
  goToNextPage,
  goToPreviousPage,
  getPreviousButton,
  getNextButton,
} from '../../pages/homePage';
import fs from 'fs';
import {
    blogActionByTitle
} from '../../pages/blogListing';
import { execSync } from 'child_process';
import path from 'path';
import { loginAdmin } from '../../pages/loginPage';

const rootDir = path.resolve(__dirname, '../../..');

// 🔹 Reset + seed ONCE
test.beforeAll(() => {
        const logFile = path.join(process.cwd(), 'test-setup.log');
  
        const logStream = fs.openSync(logFile, 'a');
        execSync('npm run reset --workspace=server', {
          cwd: rootDir,
          stdio: ['ignore', logStream, logStream], // stdin, stdout, stderr
        });
  
        execSync('npm run seed --workspace=server', {
          cwd: rootDir,
          stdio: ['ignore', logStream, logStream],
        });
});

test.describe('Admin User x Blog Listing: Can', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAdmin(page);
  });

    test('toggle across pages', async ({ page }) => {
      await expect(await getCurrentPageNumber(page)).toBe(1);
      await expect(getPreviousButton(page)).toBeDisabled();

      await goToNextPage(page);
      await expect(await getCurrentPageNumber(page)).toBe(2);
      await expect(getNextButton(page)).toBeDisabled();

      await goToPreviousPage(page);
      await expect(await getCurrentPageNumber(page)).toBe(1);
    });

    test('View a blog', async ({ page }) => {
        await blogActionByTitle(page, 'Microservices Architecture Explained', 'View');
    });

    test('Edit a blog', async ({ page }) => {
        await blogActionByTitle(page, 'Microservices Architecture Explained', 'Edit');
    });

    test('delete a blogs and check pagination reduces automatically', async ({ page }) => {
        await blogActionByTitle(page, 'Getting Started with TypeScript', 'Delete');
        await blogActionByTitle(page, 'CSS Grid vs Flexbox: When to Use Which', 'Delete');
         await expect(
            page.locator('button[aria-label="Go to page 2"]')
          ).not.toBeVisible();
        await expect(getNextButton(page)).not.toBeVisible();
        await expect(getPreviousButton(page)).not.toBeVisible();
    });
});
