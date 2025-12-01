import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, generateBlogData, createBlogPost } from './helpers';

test.describe('Blog Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin before each test
        await loginAsAdmin(page);
    });

    test.afterEach(async ({ page }) => {
        // Logout after each test
        await logout(page);
    });

    test('should create a new blog post and publish it', async ({ page }) => {
        // Generate test data
        const blogData = generateBlogData();

        // Navigate to home page
        await page.goto('/');

        // Navigate to dashboard first
        await page.getByRole('button', { name: /dashboard/i }).or(page.getByRole('link', { name: /dashboard/i })).click();
        await page.waitForTimeout(1000);

        // Click create/new post button
        const createButton = page.getByRole('button', { name: /create|new post/i })
            .or(page.getByRole('link', { name: /create|new post/i }));
        await createButton.click();

        // Wait for editor to load
        await page.waitForTimeout(1000);

        // Fill in title
        const titleInput = page.getByLabel(/title/i);
        await titleInput.fill(blogData.title);

        // Fill in content - handle different editor types
        const contentField = page.getByLabel(/content|body/i)
            .or(page.locator('[contenteditable="true"]'))
            .or(page.locator('textarea[name="content"]'))
            .first();
        await contentField.click();
        await contentField.fill(blogData.content);

        // Fill in excerpt (required field)
        await page.getByLabel(/excerpt/i).fill(blogData.content.substring(0, 100));

        // Select category - use class selector as fallback
        const categorySelect = page.locator('.MuiSelect-select').first();
        await categorySelect.click();

        // Wait for the dropdown options to appear
        await page.getByRole('listbox').waitFor();

        // Click the 'Technology' option specifically
        await page.getByRole('option', { name: 'Technology' }).click();

        // Verify category is selected (text should update)
        await expect(categorySelect).toHaveText('Technology');

        // Take screenshot before publishing
        await page.screenshot({ path: 'test-results/before-publish.png', fullPage: true });

        // Publish the post
        const publishButton = page.locator('(//button[contains(text(),"Publish")])[2]');
        await publishButton.click();

        // Wait for success indication (could be redirect, toast, or message)
        await page.waitForTimeout(2000);

        // Navigate to home/blog list to verify post appears
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify the post appears in the list
        const postTitle = page.getByText(blogData.title);
        await expect(postTitle).toBeVisible({ timeout: 10000 });

        // Take screenshot of published post
        await page.screenshot({ path: 'test-results/after-publish.png', fullPage: true });

        // Optional: Click on the post to verify it opens
        await postTitle.click();
        await page.waitForTimeout(1000);

        // Verify we're on the post page with correct content
        await expect(page.getByText(blogData.title)).toBeVisible();
        // Check for a substring of the content to be more robust
        // Check for the unique timestamp part of the content
        const timestamp = blogData.content.match(/created at (.*?). It/)?.[1];
        if (timestamp) {
            await expect(page.getByText(timestamp, { exact: false })).toBeVisible();
        } else {
            // Fallback to title if regex fails (shouldn't happen with generateBlogData)
            await expect(page.getByText(blogData.title)).toBeVisible();
        }
    });

    test('should delete a blog post with confirmation', async ({ page }) => {
        // First, create a post to delete
        const blogData = generateBlogData();
        await createBlogPost(page, blogData);

        // Navigate to home/blog list
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify the post exists
        await expect(page.getByText(blogData.title)).toBeVisible({ timeout: 30000 });

        // Navigate to dashboard to delete the post
        await page.getByRole('button', { name: /dashboard/i }).or(page.getByRole('link', { name: /dashboard/i })).click();
        await page.waitForTimeout(1000);

        // Find the post card/container in dashboard
        const postElement = page.locator(`text=${blogData.title}`).first();

        // Look for delete button - it might be in a menu or directly visible
        // Try multiple selectors
        let deleteButton = postElement.locator('..').locator('..').getByRole('button', { name: /delete/i });

        // If not found, try looking for a menu/options button first
        if (await deleteButton.count() === 0) {
            const menuButton = postElement.locator('..').locator('..').getByRole('button', { name: /menu|options|more/i });
            if (await menuButton.count() > 0) {
                await menuButton.first().click();
                await page.waitForTimeout(500);
                deleteButton = page.getByRole('button', { name: /delete/i }).or(page.getByRole('menuitem', { name: /delete/i }));
            }
        }

        // Click delete button
        console.log('Clicking delete icon...');
        await deleteButton.first().click();

        // Wait for confirmation dialog
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        console.log('Delete dialog visible');

        // Take screenshot of confirmation dialog
        await page.screenshot({ path: 'test-results/delete-confirmation.png' });

        // Confirm deletion - use specific test id
        const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
        console.log('Clicking confirm button...');
        await page.waitForTimeout(500); // Wait for dialog animation
        await confirmButton.click({ force: true });

        // Wait for deletion to complete
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');

        // Verify the post is no longer visible
        await expect(page.getByText(blogData.title)).not.toBeVisible({ timeout: 30000 });

        // Take screenshot after deletion
        await page.screenshot({ path: 'test-results/after-delete.png', fullPage: true });
    });

    test('should handle draft and published status', async ({ page }) => {
        const blogData = generateBlogData();

        // Navigate to create post
        await page.goto('/');

        // Navigate to dashboard first
        await page.getByRole('button', { name: /dashboard/i }).or(page.getByRole('link', { name: /dashboard/i })).click();
        await page.waitForTimeout(1000);

        const createButton = page.getByRole('button', { name: /create|new post/i })
            .or(page.getByRole('link', { name: /create|new post/i }));
        await createButton.click();

        // Fill in post details
        await page.getByLabel(/title/i).fill(blogData.title);
        const contentField = page.getByLabel(/content|body/i)
            .or(page.locator('[contenteditable="true"]'))
            .first();
        await contentField.click();
        await contentField.fill(blogData.content);

        // Fill in excerpt (required field)
        await page.getByLabel(/excerpt/i).fill(blogData.content.substring(0, 100));

        // Select category - use class selector as fallback
        const categorySelect = page.locator('.MuiSelect-select').first();
        await categorySelect.click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: 'Technology' }).click();

        // Ensure status is draft (should be default, but good to be explicit if we were toggling)
        // The toggle is already 'draft' by default.

        // Click Save button
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Wait for navigation to admin dashboard
        await page.waitForURL(/\/admin/);

        // Navigate to home page
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Draft should not appear in public list
        await expect(page.getByText(blogData.title)).not.toBeVisible();
    });
});
