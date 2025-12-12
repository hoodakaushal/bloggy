import { Page, Locator } from '@playwright/test';

/**
 * Returns a locator for an element by fuzzy class match
 * @param page Playwright Page object
 * @param fuzzyClass core part of the class (e.g., "MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root")
 */
export function fuzzyClass(page: Page, fuzzyClass: string): Locator {
  return page.locator(`[class*="${fuzzyClass}"]`);
}
