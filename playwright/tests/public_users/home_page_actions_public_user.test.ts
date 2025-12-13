// Will verify blog content via this curl http://localhost:3001/api/blogs/public/1

import { test, expect } from '@playwright/test';
import {
  openAndSelectCategoryDropdown,
  searchBlogs,
  clearSearchBlogs,
  getBlogRows,
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
  clickHomeButton
} from '../../pages/homePage';
import {
  verifyBlogContent,
  getLikes,
  clickLike,
  getTotalComments,
  setCommentTitle,
  setCommentBody,
  postComment,
  validateLatestComment
  
} from '../../pages/blogDetails';

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = path.resolve(__dirname, '../../..');

test.describe('Public User Home Actions: User can ', () => {

  // Run reset + seed ONCE before all tests
  test.beforeAll(() => {
    execSync('npm run reset --workspace=server', { stdio: 'inherit', cwd: rootDir });
    execSync('npm run seed --workspace=server', { stdio: 'inherit', cwd: rootDir });
  });

  // Before each test: go to homepage & open blog
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });


test('see read icon and redirect via home button (with persistence)', async ({ page, context }) => {
  // 1️⃣ Mark blog as read
  await clickReadMoreForBlog(page, 'Getting Started with TypeScript');

  // 2️⃣ Navigate back via Home
  await clickHomeButton(page);

  // 3️⃣ Validate read chip
  await validateReadChip(page);

  // 4️⃣ HARD reload → read state should persist
  await page.reload({ waitUntil: 'networkidle' });
  await validateReadChip(page);

  // 5️⃣ New tab (same session)
  const newPage = await context.newPage();
  await newPage.goto('/');
  await validateReadChip(newPage);

  // 6️⃣ Full session persistence (storage check)
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

  // Default mode (fresh session)
  await checkDarkOrLightMode(page, 'light');

  // Toggle → Dark
  await toggleTheme(page, 'dark')
  await checkDarkOrLightMode(page, 'dark');

  // Verify across pages
  await verifyThemeAcrossPages(page, 'dark');

  // HARD reload (real user refresh)
  await page.reload({ waitUntil: 'networkidle' });
  await checkDarkOrLightMode(page, 'dark');

  // Close tab → simulate browser restart
  await page.close();

  const newPage = await context.newPage();
  await newPage.goto('/');

  // Theme must persist
  await checkDarkOrLightMode(newPage, 'dark');

  // Toggle back → Light
  await toggleTheme(newPage, 'light')
  await checkDarkOrLightMode(newPage, 'light');

  // Verify light persists across pages
  await verifyThemeAcrossPages(newPage, 'light');
});

});
