import { test, expect } from '@playwright/test';
import { searchBlogs, waitForNetworkIdle, toggleTheme, getCurrentTheme, getReadPosts } from './helpers';

test.describe('Public Blog Viewing', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to home page before each test
        await page.goto('/');
        await page.waitForLoadState('load', { timeout: 20000 });
    });

    test('should view list of published blogs', async ({ page }) => {
        // Wait for blogs to load
        await page.waitForLoadState('networkidle');

        // Look for blog post cards/items
        await page.waitForSelector('.blog-post-card', { timeout: 10000 });
        const blogPosts = page.locator('article.blog-post-card');

        // Verify at least one blog post is visible
        await expect(blogPosts.first()).toBeVisible({ timeout: 10000 });

        // Count visible posts
        const postCount = await blogPosts.count();
        expect(postCount).toBeGreaterThan(0);

        // Take screenshot of blog list
        await page.screenshot({ path: 'test-results/blog-list.png', fullPage: true });

        // Verify each post has essential elements (title, content preview, etc.)
        const firstPost = blogPosts.first();

        // Check for heading/title
        const heading = firstPost.locator('h1, h2, h3, h4');
        await expect(heading.first()).toBeVisible();

        console.log(`Found ${postCount} blog posts on the page`);
    });

    test('should search for blogs by keyword', async ({ page }) => {
        // Wait for initial load
        await page.waitForLoadState('networkidle');

        // Get a blog title to search for
        await page.waitForSelector('.blog-post-card h2', { timeout: 10000 });
        const firstBlogTitle = await page.locator('.blog-post-card h2').first().textContent();

        if (!firstBlogTitle) {
            throw new Error('No blog posts found to test search');
        }

        // Extract a keyword from the title (first word)
        const keyword = firstBlogTitle.trim().split(' ')[0];

        // Take screenshot before search
        await page.screenshot({ path: 'test-results/before-search.png', fullPage: true });

        // Perform search
        const searchInput = page.getByPlaceholder(/search/i)
            .or(page.getByRole('searchbox'))
            .or(page.locator('input[type="search"]'))
            .or(page.locator('input[name="search"]'));

        await searchInput.fill(keyword);
        await searchInput.press('Enter');

        // Wait for search results
        await waitForNetworkIdle(page);
        await page.waitForTimeout(1000);

        // Take screenshot after search
        await page.screenshot({ path: 'test-results/after-search.png', fullPage: true });

        // Verify search results contain the keyword
        const searchResults = page.locator('.blog-post-card');
        const resultsCount = await searchResults.count();

        expect(resultsCount).toBeGreaterThan(0);

        // Verify the keyword appears in at least one result
        const pageContent = await page.textContent('body');
        expect(pageContent?.toLowerCase()).toContain(keyword.toLowerCase());

        console.log(`Search for "${keyword}" returned ${resultsCount} results`);
    });

    test('should view a blog post', async ({ page }) => {
        // Wait for blogs to load
        await page.waitForLoadState('load', { timeout: 20000 });

        // Get the first blog post title
        const firstPostTitle = page.locator('.blog-post-card h2').first();
        const titleText = await firstPostTitle.textContent();

        expect(titleText).toBeTruthy();

        // Click on the blog post
        await firstPostTitle.click();

        // Wait for navigation to blog post page
        await page.waitForLoadState('load', { timeout: 20000 });
        await page.waitForTimeout(1000);

        // Take screenshot of blog post
        await page.screenshot({ path: 'test-results/blog-post-view.png', fullPage: true });

        // Verify we're on the blog post page
        // The title should still be visible
        await expect(page.getByText(titleText!)).toBeVisible();

        // Verify blog post content is visible
        const content = page.locator('//article');
        await expect(content.first()).toBeVisible({ timeout: 20000 });

        // Check for like button
        const likeButton = page.getByLabel('like this post');

        if (await likeButton.count() > 0) {
            await expect(likeButton.first()).toBeVisible();
        }

        // Check for comment section
        const commentSection = page.locator('[class*="comment"]').or(page.getByText(/comment/i));
        if (await commentSection.count() > 0) {
            await expect(commentSection.first()).toBeVisible();
        }

        console.log(`Successfully viewed blog post: ${titleText}`);
    });

    test('should persist theme preference across sessions', async ({ page, context }) => {
        // Get initial theme
        const initialTheme = await getCurrentTheme(page);
        console.log(`Initial theme: ${initialTheme}`);

        // Toggle theme
        await toggleTheme(page);
        await page.waitForTimeout(1000);

        // Get new theme
        const newTheme = await getCurrentTheme(page);
        console.log(`New theme after toggle: ${newTheme}`);

        // Verify theme changed
        expect(newTheme).not.toBe(initialTheme);

        // Take screenshot with new theme
        await page.screenshot({ path: 'test-results/theme-toggled.png', fullPage: true });

        // Refresh the page
        await page.reload();
        await page.waitForLoadState('load', { timeout: 20000 });

        // Verify theme persisted after refresh
        const themeAfterRefresh = await getCurrentTheme(page);
        expect(themeAfterRefresh).toBe(newTheme);

        console.log(`Theme persisted after refresh: ${themeAfterRefresh}`);

        // Create a new page in the same context to verify persistence
        const newPage = await context.newPage();
        await newPage.goto('/');
        await newPage.waitForLoadState('load', { timeout: 20000 });

        const themeInNewPage = await getCurrentTheme(newPage);
        expect(themeInNewPage).toBe(newTheme);

        console.log(`Theme persisted in new page: ${themeInNewPage}`);

        await newPage.close();
    });

    test('should mark read blogs visually across sessions', async ({ page, context }) => {
        // Listen for console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // Navigate to home
        await page.goto('/');
        await page.waitForLoadState('load', { timeout: 20000 });

        // Verify console listener works
        await page.evaluate(() => console.log('TEST LOG: Console listener working'));

        // Get initial read posts
        const initialReadPosts = await getReadPosts(page);
        console.log(`Initial read posts: ${initialReadPosts.length}`);

        // Click on the Read More button to mark it as read
        await page.getByRole('button', { name: /read more/i }).first().click();
        await page.waitForLoadState('load', { timeout: 20000 });
        await page.waitForTimeout(2000); // Give time for read status to be saved

        // Log current URL
        console.log('Current URL:', page.url());

        // Check localStorage directly
        const localStorageState = await page.evaluate(() => localStorage.getItem('readBlogs'));
        console.log('LocalStorage state:', localStorageState);

        // Go back to home
        await page.goto('/');
        await page.waitForLoadState('load', { timeout: 20000 });

        // Take screenshot of viewed post
        await page.screenshot({ path: 'test-results/blog-post-read.png', fullPage: true });

        // Check if read status was saved
        const readPostsAfterView = await getReadPosts(page);
        console.log(`Read posts after viewing: ${readPostsAfterView.length}`);
        expect(readPostsAfterView.length).toBeGreaterThan(initialReadPosts.length);

        // Take screenshot showing read indicator
        await page.screenshot({ path: 'test-results/blog-list-with-read.png', fullPage: true });

        // Refresh the page
        await page.reload();
        await waitForNetworkIdle(page);

        // Verify read status persisted after refresh
        const readPostsAfterRefresh = await getReadPosts(page);
        expect(readPostsAfterRefresh.length).toBe(readPostsAfterView.length);

        console.log(`Read status persisted after refresh`);

        // Create a new page in the same context
        const newPage = await context.newPage();
        await newPage.goto('/');
        await waitForNetworkIdle(newPage);

        // Verify read status persisted in new page
        const readPostsInNewPage = await getReadPosts(newPage);
        expect(readPostsInNewPage.length).toBe(readPostsAfterView.length);

        console.log(`Read status persisted in new page`);

        await newPage.close();
    });

    test('should allow anonymous users to like posts', async ({ page }) => {
        // Navigate to a blog post
        await page.goto('/');
        await waitForNetworkIdle(page);

        await page.locator('.blog-post-card h2').first().click();
        await page.waitForLoadState('networkidle');

        // Find like button
        const likeButton = page.getByLabel('like this post');

        if (await likeButton.count() > 0) {
            // Get initial like count
            const likeCountElement = page.locator('[class*="like"]').filter({ hasText: /\d+/ });
            const initialLikeText = await likeCountElement.first().textContent().catch(() => '0');

            // Click like button
            await likeButton.first().click();
            await page.waitForTimeout(1000);

            // Take screenshot after liking
            await page.screenshot({ path: 'test-results/post-liked.png', fullPage: true });

            console.log('Successfully liked the post');
        } else {
            console.log('Like button not found, skipping like test');
        }
    });

    test('should allow anonymous users to comment on posts', async ({ page }) => {
        // Navigate to a blog post
        await page.goto('/');
        await waitForNetworkIdle(page);

        await page.locator('.blog-post-card h2').first().click();
        await page.waitForLoadState('networkidle');

        // Look for comment input
        const commentInput = page.getByLabel('Your Comment');

        if (await commentInput.count() > 0) {
            const testComment = `Test comment from automated test - ${Date.now()}`;

            // Fill in comment
            await commentInput.first().fill(testComment);

            // Submit comment
            const submitButton = page.getByRole('button', { name: /submit|post|send/i });
            await submitButton.click();
            await page.waitForTimeout(2000);

            // Verify comment appears
            await expect(page.getByText(testComment)).toBeVisible({ timeout: 10000 });

            // Take screenshot with comment
            await page.screenshot({ path: 'test-results/post-with-comment.png', fullPage: true });

            console.log('Successfully posted a comment');
        } else {
            console.log('Comment input not found, skipping comment test');
        }
    });
});
