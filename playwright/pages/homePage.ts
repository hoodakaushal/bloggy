import { Page } from '@playwright/test';
import { fuzzyClass } from '../utils/helper';

/**
 * Opens a category dropdown and selects a value
 */
export async function openAndSelectCategoryDropdown(page: Page, category: string) {
  await fuzzyClass(page, 'MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root').click();
 await page.getByRole('option', { name: category }).click();
}

/**
 * Fills search input
 */
export async function searchBlogs(page: Page, keyword: string) {
  await page.locator('input[placeholder="Search blogs..."]').fill(keyword);
}

export async function clearSearchBlogs(page: Page) {
  await page.locator('input[placeholder="Search blogs..."]').clear();
}

export function getBlogRows(page: Page) {
 return page.locator('.MuiTypography-h5');
}

export async function clickReadMoreForBlog(page: Page, blogTitle: string) {
  const blogCard = page.locator('div.MuiCard-root', {
    has: page.locator('h2', { hasText: blogTitle })
  });

  await blogCard.getByRole('button', { name: 'Read More' }).click();
}
