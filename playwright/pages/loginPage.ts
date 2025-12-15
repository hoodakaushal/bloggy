import { Page, expect, Locator } from '@playwright/test';
import { fuzzyClass } from '../utils/helper';

export async function loginAdmin(page: Page) {
  await page.goto('/login');
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
}


