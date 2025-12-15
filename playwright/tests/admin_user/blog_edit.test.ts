import { test, expect } from '@playwright/test';

import {
    fillBlogForm,
    uploadImageViaClick,
    assertImageLoaded
} from '../../pages/blogEdit';

import {
    getBlogRowByTitle,
    blogActionByTitle
} from '../../pages/blogListing';

import {
    assertExcerptVisible,
    clickReadMoreForBlog
} from '../../pages/homePage'
import { execSync } from 'child_process';
import path from 'path';
import { loginAdmin } from '../../pages/loginPage';
import { fuzzyClass } from '../../utils/helper';

const rootDir = path.resolve(__dirname, '../../..');

// 🔹 Reset + seed ONCE
test.beforeAll(() => {
  execSync('npm run reset --workspace=server', { stdio: 'inherit', cwd: rootDir });
  execSync('npm run seed --workspace=server', { stdio: 'inherit', cwd: rootDir });
});

test.describe('Admin User x Edit Blog: Can', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAdmin(page);
  });

    test('Edit Blog Title, Excerpt and Description', async ({ page }) => {
        await page.goto('/admin/blog/1', { waitUntil: 'domcontentloaded' });
        await fillBlogForm(page, {
            title: 'Advanced TypeScript Patterns',
            description: 'Deep dive into advanced TypeScript concepts',
            content: 'TypeScript generics, mapped types, and conditional types explained.',
        });

        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
        await expect(
            getBlogRowByTitle(page, 'Advanced TypeScript Patterns')
        ).toBeVisible();
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await assertExcerptVisible(
             page,
             'Deep dive into advanced TypeScript concepts'
        );

        await clickReadMoreForBlog(page, 'Advanced TypeScript Patterns');
        await expect(
            page.getByText('TypeScript generics, mapped types, and conditional types explained.', { exact: true })
        ).toBeVisible();

    });

     test('Add an image', async ({ page }) => {
        await page.goto('/admin/blog/2', { waitUntil: 'domcontentloaded' });
        await uploadImageViaClick(page, 'images/dummyImage.jpeg');

        await page.getByRole('button', { name: 'Save' }).click();
        await page.goto('/blog/2', { waitUntil: 'domcontentloaded' });
        await assertImageLoaded(page);
        
    });
// Actual bug
    //  test('Remove and upload an image', async ({ page }) => {
    //     await page.goto('/admin/blog/2', { waitUntil: 'domcontentloaded' });
    //     // Remove Image Click
    //     await fuzzyClass(page,'MuiButton-colorError').click()
    //     await page.getByRole('button', { name: 'Save' }).click();
    //     await page.goto('/blog/2', { waitUntil: 'domcontentloaded' });
    //     const image = page.locator('img[src*="/uploads/"]');
    //     await expect(image).not.toBeVisible();
    //     await page.goto('/admin/blog/2', { waitUntil: 'domcontentloaded' });
    //     await uploadImageViaClick(page, 'images/dummyImage.jpeg');

    //     await page.getByRole('button', { name: 'Save' }).click();
    //     await page.goto('/blog/2', { waitUntil: 'domcontentloaded' });
    //     await assertImageLoaded(page);
        
    // });

});
