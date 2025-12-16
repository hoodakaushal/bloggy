import { test, expect } from '@playwright/test';
import {
  clickReadMoreForBlog,
  validateReadChip,
  getCurrentPageNumber,
  goToNextPage,
  goToPreviousPage,
  getPreviousButton,
  getNextButton,
  checkDarkOrLightMode,
  verifyThemeAcrossPages,
  toggleTheme,
  clickHomeButton,
} from '../../pages/homePage';
import { loginAdmin } from '../../pages/loginPage';
import { execSync } from 'child_process';
import path from 'path';

type UserScenario = {
  title: string;
  isAdmin: boolean;
};

const scenarios: UserScenario[] = [
  { title: 'Public User', isAdmin: false },
  { title: 'Admin User', isAdmin: true },
];

const rootDir = path.resolve(__dirname, '../../..');

/* 🔹 Reset + seed ONCE */
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

/* 🔁 Run same suite for both users */
for (const { title, isAdmin } of scenarios) {
  test.describe(`${title} Home Actions: User can`, () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/');

      if (isAdmin) {
        await loginAdmin(page);
        await page.goto('/');
      }
    });

    test('see read icon and redirect via home button (with persistence)', async ({ page, context }) => {
      await clickReadMoreForBlog(page, 'Getting Started with TypeScript');

      await clickHomeButton(page);
      await validateReadChip(page);

      // Reload persistence
      await page.reload({ waitUntil: 'domcontentloaded' });
      await validateReadChip(page);

      // New tab (same session)
      const newPage = await context.newPage();
      await newPage.goto('/');
      await validateReadChip(newPage);

      // Storage persistence
      const persisted = await newPage.evaluate(() =>
        localStorage.getItem('readBlogs')
      );
      expect(persisted).toBeTruthy();
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

    test('should verify light/dark mode switches across pages and sessions', async ({ page, context }) => {
      await checkDarkOrLightMode(page, 'light');

      await toggleTheme(page, 'dark');
      await checkDarkOrLightMode(page, 'dark');

      await verifyThemeAcrossPages(page, 'dark');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await checkDarkOrLightMode(page, 'dark');

      await page.close();

      const newPage = await context.newPage();
      await newPage.goto('/');
      await checkDarkOrLightMode(newPage, 'dark');

      await toggleTheme(newPage, 'light');
      await checkDarkOrLightMode(newPage, 'light');

      await verifyThemeAcrossPages(newPage, 'light');
    });
  });
}
