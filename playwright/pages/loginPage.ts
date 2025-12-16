import { Page, Locator, expect } from '@playwright/test';
import { fuzzyClass } from '../utils/helper';

export function usernameInput(page: Page): Locator {
  return page.locator('input[type="text"]');
}

export function passwordInput(page: Page): Locator {
  return page.locator('input[type="password"]');
}

export function submitButton(page: Page): Locator {
  return page.locator('button[type=submit]');
}

export async function clickRegisterTab(page: Page) {
  await page.getByRole('tab', { name: 'Register' }).click();
}

export async function clickRegisterSubmit(page: Page) {
  const form = page.locator('form');
  await form.getByRole('button', { name: 'Register' }).click();
}

export function loginButton(page: Page) {
  return page.getByRole('button', { name: 'Login' });
}

export async function loginAdmin(
  page: Page,
  username: string = 'admin',
  password: string = 'admin123',
  assertPositive: boolean = true
) {
  await page.goto('/login');

  await usernameInput(page).fill(username);
  await passwordInput(page).fill(password);
  await loginButton(page).click();

 if (assertPositive) {
    await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
  }
}

export async function registerAdmin(
  page: Page,
  username: string = 'admin',
  password: string = 'admin123',
  assertPositive: boolean = true
) {
  await page.goto('/login');
  await clickRegisterTab(page);
  await usernameInput(page).fill(username);
  await passwordInput(page).fill(password);
  await clickRegisterSubmit(page);

  if (assertPositive) {
    await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
  }
}

export async function validateErrorMessageLoginRegisterPage(
  page: Page,
  expectedText: string
) {
  await expect(fuzzyClass(page,'MuiAlert-message')).toContainText(expectedText);
}

