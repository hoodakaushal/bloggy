import { Page, expect, Locator } from '@playwright/test';
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

export async function validateReadChip(page: Page) {
  // Select the success chip directly from the page
    const chip = page.locator('div.MuiChip-root', {
    hasText: 'Read',
    has: page.locator('[data-testid="CheckCircleIcon"]'),
  });

  await expect(chip).toBeVisible();

  // Validate label text
  await expect(chip.getByText('Read')).toBeVisible();

  // Validate check icon by testId
  await expect(chip.getByTestId('CheckCircleIcon')).toBeVisible();

  // Validate background color → success chips use rgba(46, 125, 50, 0.08)
  const bg = await chip.evaluate((el) =>
    window.getComputedStyle(el).backgroundColor
  );

  expect(bg).toBe('rgb(46, 125, 50)');
}

export function getNextButton(page: Page): Locator {
  return page.locator('button[aria-label="Go to next page"]');
}

export function getPreviousButton(page: Page): Locator {
  return page.locator('button[aria-label="Go to previous page"]');
}

export async function goToNextPage(page: Page) {
  await getNextButton(page).click();
}

export async function goToPreviousPage(page: Page) {
  await getPreviousButton(page).click();
}

export async function getCurrentPageNumber(page: Page) {
  const current = page.locator('button[aria-current]');
  await expect(current).toBeVisible();

  const value = await current.textContent();
  return Number(value?.trim());
}


export async function checkDarkOrLightMode(
  page: Page,
  mode: 'dark' | 'light'
) {
  const bgColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });

  if (mode === 'dark') {
    // Material UI dark background
    expect(bgColor).toBe('rgb(18, 18, 18)');
  } else {
    // Typical Material UI light background
    expect(bgColor).toBe('rgb(245, 245, 245)');
  }
}

export async function verifyThemeAcrossPages(
  page: Page,
  mode: 'dark' | 'light'
) {
  const routes = ['/blog/1', '/login'];

  for (const route of routes) {
    await page.goto(route);
    await checkDarkOrLightMode(page, mode);
  }
}

export async function toggleTheme(
  page: Page,
  targetMode: 'light' | 'dark'
) {
  const title =
    targetMode === 'dark'
      ? 'Switch to dark mode'
      : 'Switch to light mode';

  await page.getByTitle(title).click();
}


export async function clickHomeButton(page: Page) {
  await page.getByRole('link', { name: 'Home' }).click();
}

