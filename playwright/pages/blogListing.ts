import { Page, expect, Locator } from '@playwright/test';
import { fuzzyClass } from '../utils/helper';
import {
  goToNextPage,
} from './homePage';

export async function deleteBlogByTitle(page: Page, title: string) {
  const rowLocator = page.locator('tr').filter({ hasText: title });
  const deleteButton = rowLocator.locator('button[title="Delete"]');

 await deleteButton.click(),

   // Click confirm in the modal
  await page.locator('button[data-testid="confirm-delete-button"]').click();

  // Wait for delete API to finish
  await page.waitForResponse(res =>
    res.url().includes('/api/blogs') &&
    res.request().method() === 'DELETE' &&
    res.status() === 200
  );

  // Assert row is removed
  await expect(rowLocator).toHaveCount(0); // row no longer exists
}

export function getBlogRowByTitle(page: Page, title: string): Locator {
  return page.locator('tr').filter({ hasText: title });
}

/**
 * Clicks a button in a blog row by title.
 * Detects button by 'Delete', 'Edit', or 'View'.
 * @param page Playwright page
 * @param title Blog title
 * @param action Optional: 'delete' | 'edit' | 'view' (defaults to 'view')
\
 */
export async function blogActionByTitle(
  page: Page,
  title: string,
  action: 'Delete' | 'Edit' | 'View'
) {
  const row = getBlogRowByTitle(page, title)
  const button = row.locator(`button[title="${action}"]`);

  if (action === 'Delete') {
    await button.click();

    await page.locator('button[data-testid="confirm-delete-button"]').click();

    await page.waitForResponse(res =>
      res.url().includes('/api/blogs') &&
      res.request().method() === 'DELETE' &&
      res.status() === 200
    );

    await expect(row).toHaveCount(0);
    return;
  }
  page.waitForLoadState('domcontentloaded')

  if (await button.count() === 0) {
  // Button doesn't exist → go to next page
  await goToNextPage(page);
  } 

  // View / Edit
  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    button.first().click(),
  ]);

  const headerTitle = page.locator('h1');

  if (action === 'View') {
    await expect(page.locator('.MuiChip-colorPrimary')).toBeVisible();
  }

  if (action === 'Edit') {
    await expect(headerTitle).toHaveText('Edit Blog Post');
  }
}

export async function clickNewBlogPost(page: Page) {
  await page.getByRole('button', { name: 'New Blog Post' }).click();
}