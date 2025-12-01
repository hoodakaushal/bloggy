import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, createBlogPost } from './helpers';

test.describe('Security Tests', () => {

    test('should prevent XSS in blog comments', async ({ page }) => {
        // 1. Create a blog post to comment on
        await loginAsAdmin(page);
        const blogData = {
            title: `XSS Test Blog ${Date.now()}`,
            content: 'Testing XSS vulnerability in comments',
            excerpt: 'XSS Test',
            category: 'Technology',
            tags: ['Security']
        };
        await createBlogPost(page, blogData);
        await logout(page);

        // 2. Navigate to the blog post as anonymous user
        await page.goto('/');

        // Find the blog post card and click Read More
        const blogCard = page.locator('.blog-post-card').filter({ hasText: blogData.title }).first();
        await blogCard.getByRole('button', { name: /read more/i }).click();

        // Wait for blog post to load
        await expect(page.getByRole('heading', { level: 1, name: blogData.title })).toBeVisible();

        // 3. Attempt to inject XSS in comment
        const xssPayload = '<script>alert("XSS")</script>';
        const safeComment = 'This is a test comment';

        // Scroll to bottom to ensure comment section is in view
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.getByText('Comments (').waitFor(); // Wait for comments header

        // Fill in name (required for anonymous)
        await page.getByRole('textbox', { name: /your name/i }).fill('Hacker');

        // Fill in comment
        const commentInput = page.getByRole('textbox', { name: /your comment/i });
        await expect(commentInput).toBeVisible();
        await commentInput.fill(`${safeComment} ${xssPayload}`);

        // Submit
        await page.getByRole('button', { name: /post comment/i }).click();

        // 4. Verify the script is NOT executed
        // We can check this by ensuring no dialog appears
        let dialogTriggered = false;
        page.on('dialog', () => { dialogTriggered = true; });

        // Wait for comment to appear
        await expect(page.getByText(safeComment)).toBeVisible();

        expect(dialogTriggered).toBe(false);

        // 5. Verify the payload is displayed as text (escaped) or sanitized
        // It should be visible as text content, meaning it was escaped
        await expect(page.getByText(xssPayload)).toBeVisible();

    });

    test('should redirect unauthenticated users from admin routes', async ({ page }) => {
        const protectedRoutes = [
            '/admin',
            '/admin/blog/new',
            '/admin/blog/1' // Assuming ID 1 exists or handled
        ];

        for (const route of protectedRoutes) {
            await page.goto(route);
            await expect(page).toHaveURL(/\/login/);
        }
    });

    test('should prevent SQL injection in login', async ({ page }) => {
        await page.goto('/login');

        const sqlInjectionPayloads = [
            "' OR '1'='1",
            "admin' --",
            "' UNION SELECT * FROM users --"
        ];

        for (const payload of sqlInjectionPayloads) {
            await page.getByLabel(/email|username/i).fill(payload);
            await page.getByLabel(/password/i).fill('randompassword');
            await page.getByRole('button', { name: /login|sign in/i }).click();

            // Should verify that we are NOT logged in
            // Check for error message or stay on login page
            await expect(page.getByRole('alert').first()).toBeVisible();
            await expect(page).toHaveURL(/\/login/);
        }
    });

    test('should prevent unauthorized API access', async ({ request }) => {
        // Attempt to delete a blog post without auth token
        // Assuming ID 1 exists, or we can just try any ID
        const response = await request.delete('/api/blogs/1');
        expect(response.status()).toBe(401); // Unauthorized
    });
});
