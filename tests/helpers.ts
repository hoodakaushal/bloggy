import { Page, expect } from '@playwright/test';

/**
 * Admin credentials for testing
 */
export const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
};

/**
 * Common URLs
 */
export const URLS = {
    frontend: 'http://localhost:5173',
    backend: 'http://localhost:3001',
};

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
    await page.goto('/');

    // Look for login button or link
    const loginButton = page.getByRole('button', { name: /login/i }).or(page.getByRole('link', { name: /login/i }));
    await loginButton.click();

    // Fill in credentials
    await page.getByLabel(/username/i).fill(ADMIN_CREDENTIALS.username);
    await page.getByLabel(/password/i).fill(ADMIN_CREDENTIALS.password);

    // Submit form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait for successful login (redirect or admin UI appears)
    await page.waitForURL(/.*/, { timeout: 5000 });

    // Verify we're logged in by checking for admin-specific elements
    await expect(page.getByText(/create|new post/i).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
    }
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Generate random blog post data
 */
export function generateBlogData() {
    const timestamp = Date.now();
    return {
        title: `Test Blog Post ${timestamp}`,
        content: `This is test content for blog post created at ${new Date().toISOString()}. It contains enough text to be meaningful for testing purposes.`,
        category: 'Technology',
        tags: ['test', 'automation'],
    };
}

/**
 * Create a blog post via UI
 */
export async function createBlogPost(page: Page, data: { title: string; content: string }) {
    // Navigate to dashboard first
    await page.getByRole('button', { name: /dashboard/i }).or(page.getByRole('link', { name: /dashboard/i })).click();
    await page.waitForTimeout(1000);

    // Click create/new post button
    await page.getByRole('button', { name: /create|new post/i }).or(page.getByRole('link', { name: /create|new post/i })).click();

    // Wait for editor to load
    await page.waitForTimeout(1000);

    // Fill in title
    await page.getByLabel(/title/i).fill(data.title);

    // Fill in content - try different selectors for rich text editor
    const contentField = page.getByLabel(/content|body/i).or(page.locator('[contenteditable="true"]')).or(page.locator('textarea[name="content"]')).first();
    await contentField.click();
    await contentField.fill(data.content);

    // Fill in excerpt
    await page.getByLabel(/excerpt/i).fill(data.content.substring(0, 100));

    // Select category - use class selector as fallback
    // Select category - use class selector as fallback
    const categorySelect = page.locator('.MuiSelect-select').first();
    await categorySelect.click();

    // Wait for the dropdown options to appear
    await page.getByRole('listbox').waitFor();

    // Click the 'Technology' option specifically
    await page.getByRole('option', { name: 'Technology' }).click();

    // Verify category is selected (text should update)
    await expect(categorySelect).toHaveText('Technology');

    // Publish the post
    const publishButton = page.locator('(//button[contains(text(),"Publish")])[2]');
    await expect(publishButton).toBeEnabled({ timeout: 10000 });
    await publishButton.click();

    // Wait for success message or redirect to admin
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.waitForTimeout(1000);
}

/**
 * Delete a blog post via UI
 */
export async function deleteBlogPost(page: Page, postTitle: string) {
    // Find the post and click delete
    const postCard = page.locator(`text=${postTitle}`).locator('..').locator('..');
    await postCard.getByRole('button', { name: /delete/i }).click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);
}

/**
 * Search for blogs
 */
export async function searchBlogs(page: Page, keyword: string) {
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await searchInput.fill(keyword);
    await searchInput.press('Enter');
    await waitForNetworkIdle(page);
}

/**
 * Toggle theme (dark/light mode)
 */
export async function toggleTheme(page: Page) {
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i }).or(page.locator('[aria-label*="theme"]'));
    await themeToggle.click();
    await page.waitForTimeout(500);
}

/**
 * Get current theme from localStorage
 */
export async function getCurrentTheme(page: Page): Promise<string | null> {
    return await page.evaluate(() => localStorage.getItem('themeMode'));
}

/**
 * Navigate to specific page number
 */
export async function navigateToPage(page: Page, pageNumber: number) {
    await page.goto(`/?page=${pageNumber}`);
    await waitForNetworkIdle(page);
}

/**
 * Get current page number from URL
 */
export async function getCurrentPageFromURL(page: Page): Promise<number> {
    const url = new URL(page.url());
    const pageParam = url.searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
}

/**
 * Click next page button
 */
export async function clickNextPage(page: Page) {
    await page.getByRole('button', { name: /next/i }).or(page.locator('[aria-label*="next"]')).click();
    await waitForNetworkIdle(page);
}

/**
 * Click previous page button
 */
export async function clickPreviousPage(page: Page) {
    await page.getByRole('button', { name: /previous|prev/i }).or(page.locator('[aria-label*="previous"]')).click();
    await waitForNetworkIdle(page);
}

/**
 * Check if a blog post is marked as read
 */
export async function isBlogMarkedAsRead(page: Page, postTitle: string): Promise<boolean> {
    const postCard = page.locator(`text=${postTitle}`).locator('..').locator('..');
    const hasReadIndicator = await postCard.locator('[class*="read"]').count() > 0;
    return hasReadIndicator;
}

/**
 * Get read posts from localStorage
 */
export async function getReadPosts(page: Page): Promise<string[]> {
    const readPosts = await page.evaluate(() => {
        const stored = localStorage.getItem('readBlogs');
        return stored ? JSON.parse(stored) : [];
    });
    return readPosts;
}
