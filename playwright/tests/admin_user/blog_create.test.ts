import { test, expect } from '@playwright/test';

import {
    fillBlogForm,
    selectTags,
    selectCategory,
} from '../../pages/blogEdit';

import {
    getBlogRowByTitle,
    blogActionByTitle,
    clickNewBlogPost
} from '../../pages/blogListing';

import { execSync } from 'child_process';
import path from 'path';
import { loginAdmin } from '../../pages/loginPage';

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

test.describe('Admin User x Create Blog:', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAdmin(page);
  });

    test('Create a draft blog', async ({ page }) => {
        await clickNewBlogPost(page);
        await fillBlogForm(page, {
            title: 'Advanced TypeScript Patterns',
            description: 'Deep dive into advanced TypeScript concepts',
            content: 'TypeScript generics, mapped types, and conditional types explained.',
        });
        await selectCategory(page, 'Technology');
        await selectTags(page, ['React', 'TypeScript']);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Save' }).click();
         await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
        const row = getBlogRowByTitle(page, 'Advanced TypeScript Patterns')
        expect(row).toBeVisible();
        await expect(
            row.getByText('draft', { exact: true })
            ).toBeVisible();
    });

      test('Make draft a published blog', async ({ page }) => {
        await blogActionByTitle(page, 'Advanced TypeScript Patterns', 'Edit');
        await page.locator('button[value="published"]').click();
        page.getByRole('button', { name: 'Save' }).click();
        await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
        const row = getBlogRowByTitle(page, 'Advanced TypeScript Patterns')
        expect(row).toBeVisible();
        await expect(
            row.getByText('published', { exact: true })
            ).toBeVisible();
    });

        test('Create a published blog', async ({ page }) => {
        await clickNewBlogPost(page);
        await fillBlogForm(page, {
            title: 'Playwright Patterns',
            description: 'Deep dive into advanced TypeScript concepts',
            content: 'TypeScript generics, mapped types, and conditional types explained.',
        });
        await selectCategory(page, 'Programming');
        await selectTags(page, ['React', 'TypeScript']);
        await page.keyboard.press('Escape');
        await page.locator('button[value="published"]').click();
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
        const row = getBlogRowByTitle(page, 'Playwright Patterns')
        expect(row).toBeVisible();
        await expect(
            row.getByText('published', { exact: true })
            ).toBeVisible();
    });



});
