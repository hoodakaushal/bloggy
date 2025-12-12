import { test, expect } from '@playwright/test';
import { openAndSelectCategoryDropdown, searchBlogs, clearSearchBlogs, getBlogRows } from '../../pages/homePage';


test('Verify Search Functionality works', async ({ page }) => {

  await test.step('Verify title and keyword search', async () => {
    await page.goto('/'); // baseURL will be used if set
    await searchBlogs(page, 'Docker');
    await expect(getBlogRows(page)).toHaveText('Docker for Developers: A Practical Guide');
    await expect(getBlogRows(page)).toHaveCount(1);

  });

  await test.step('Search results should be empty on choosing wrong category', async () => {
    await openAndSelectCategoryDropdown(page, 'Programming');
    await expect(getBlogRows(page)).toBeHidden();
  });

  await test.step('Search results should be appear on choosing the correct category again', async () => {
    await openAndSelectCategoryDropdown(page, 'Technology');
    await expect(getBlogRows(page)).toHaveText('Docker for Developers: A Practical Guide');
    await expect(getBlogRows(page)).toHaveCount(1);
  });

   await test.step('All results should appear on resetting to All categories and deleteing search', async () => {
    await openAndSelectCategoryDropdown(page, 'All Categories');
    await clearSearchBlogs(page);
    await expect(getBlogRows(page)).toHaveCount(9);
    await expect(page.locator('button[aria-label="Go to page 2"]')).toBeVisible();
  });
});


test('Verify Invalid Search Params', async ({ page }) => {
    await page.goto('/');
    await searchBlogs(page, 'Ojas');
    await expect(getBlogRows(page)).toHaveCount(0);
});
