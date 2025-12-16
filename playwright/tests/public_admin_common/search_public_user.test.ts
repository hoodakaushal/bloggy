import { test, expect } from '@playwright/test';
import {
  openAndSelectCategoryDropdown,
  searchBlogs,
  clearSearchBlogs,
  getBlogRows,
} from '../../pages/homePage';
import { execSync } from 'child_process';
import path from 'path';
import { loginAdmin } from '../../pages/loginPage';

type UserScenario = {
  title: string;
  isAdmin: boolean;
};

const scenarios: UserScenario[] = [
  { title: 'Public User', isAdmin: false },
  { title: 'Admin User', isAdmin: true },
];

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

for (const { title, isAdmin } of scenarios) {
  test.describe(`${title} Blog Details: User can`, () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/');

      if (isAdmin) {
        await loginAdmin(page);
        await page.goto('/');
      }
    });

    test('Verify Search Functionality works', async ({ page }) => {
      await test.step('Verify title and keyword search', async () => {
        await searchBlogs(page, 'Docker');
        await expect(getBlogRows(page)).toHaveText(
          'Docker for Developers: A Practical Guide'
        );
        await expect(getBlogRows(page)).toHaveCount(1);
      });

      await test.step('Search results should be empty on choosing wrong category', async () => {
        await openAndSelectCategoryDropdown(page, 'Programming');
        await expect(getBlogRows(page)).toBeHidden();
      });

      await test.step(
        'Search results should appear on choosing the correct category again',
        async () => {
          await openAndSelectCategoryDropdown(page, 'Technology');
          await expect(getBlogRows(page)).toHaveText(
            'Docker for Developers: A Practical Guide'
          );
          await expect(getBlogRows(page)).toHaveCount(1);
        }
      );

      await test.step(
        'All results should appear on resetting to All categories and deleting search',
        async () => {
          await openAndSelectCategoryDropdown(page, 'All Categories');
          await clearSearchBlogs(page);
          await expect(getBlogRows(page)).toHaveCount(9);
          await expect(
            page.locator('button[aria-label="Go to page 2"]')
          ).toBeVisible();
        }
      );
    });

    test('Verify Invalid Search Params', async ({ page }) => {
      await searchBlogs(page, 'Ojas');
      await expect(getBlogRows(page)).toHaveCount(0);
    });
  });
}
