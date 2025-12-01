import { test, expect } from '@playwright/test';
import { loginAsAdmin, createBlogPost } from './helpers';

test.describe('Visual Regression Tests', () => {

    test('home page content aria snapshot', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        // Use Aria snapshot for dynamic content (blog list)
        await expect(page.locator('body')).toMatchAriaSnapshot(`
          - banner:
            - link "Blog App"
            - link "Home"
            - link "Admin Login"
            - button "toggle theme"
          - heading "Welcome to Our Blog" [level=1]
          - textbox "Search blogs..."
          - text: Category
          - combobox
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - article:
            - heading /XSS Test Blog \\d+/ [level=2]
            - text: Technology
            - paragraph: Testing XSS vulnerability in comments
            - text: /December 1, \\d+ \\d+ \\d+ \\d+/
            - button "Read More"
          - navigation "pagination navigation":
            - list:
              - listitem:
                - button "Go to previous page" [disabled]
              - listitem:
                - button "page 1": "1"
              - listitem:
                - button "Go to page 2": "2"
              - listitem:
                - button "Go to page 3": "3"
              - listitem:
                - button "Go to page 4": "4"
              - listitem:
                - button "Go to page 5": "5"
              - listitem: /.*/
              - listitem:
                 - button /Go to page \\d+/: /\\d+/
              - listitem:
                - button "Go to next page"
        `);
    });

    test('login page snapshot', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('login-page.png');
    });

    test('blog view aria snapshot', async ({ page }) => {
        // Navigate to the first available blog post
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const firstPost = page.locator('.blog-post-card h2').first();
        if (await firstPost.count() > 0) {
            await page.getByRole('button', { name: /read more/i }).first().click();
            await page.waitForLoadState('networkidle');
            // Use Aria snapshot for blog view
            await expect(page.locator('body')).toMatchAriaSnapshot(`
              - banner:
                - link "Blog App"
                - link "Home"
                - link "Admin Login"
                - button "toggle theme"
              - heading /XSS Test Blog \\d+/ [level=1]
              - text: Live Technology
              - paragraph: /\\d+ views/
              - button "like this post"
              - paragraph: /\\d+ likes/
              - text: /Published on December 1, \\d+ at \\d+:\\d+ [AP]M/
              - separator
              - paragraph: Testing XSS vulnerability in comments
              - separator
              - heading /Comments \\(\\d+\\)/ [level=5]
              - text: Your Name
              - textbox "Your Name"
              - paragraph: Enter your name to post a comment
              - text: Your Comment
              - textbox "Your Comment"
              - paragraph: /0\\/\\d+ characters/
              - button "Post Comment"
              - list:
                - listitem:
                  - heading "Hacker" [level=6]
                  - paragraph: /This is a test comment December 1, \\d+ at \\d+:\\d+ [AP]M/
            `);
        }
    });

    test('admin dashboard aria snapshot', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
        // Use Aria snapshot for dynamic content (table)
        await expect(page.locator('body')).toMatchAriaSnapshot(`
          - banner:
            - link "Blog App"
            - link "Home"
            - link "Dashboard"
            - button "Logout"
            - button "toggle theme"
          - heading "Blog Management" [level=1]
          - button "Create New Post"
          - table:
            - rowgroup:
              - row "Title Category Status Views Likes Comments Created Actions":
                - columnheader "Title"
                - columnheader "Category"
                - columnheader "Status"
                - columnheader "Views"
                - columnheader "Likes"
                - columnheader "Comments"
                - columnheader "Created"
                - columnheader "Actions"
            - rowgroup:
              - row /XSS Test Blog \\d+ Technology published \\d+ 0 1 Dec 1, \\d+/:
                - cell /XSS Test Blog \\d+/
                - cell "Technology"
                - cell "published"
                - cell /\\d+/
                - cell "0"
                - cell "1"
                - cell /Dec 1, \\d+/
                - cell:
                  - button "View"
                  - button "Edit"
                  - button "Delete"
              - row /.*/
              - row /.*/
              - row /.*/
              - row /.*/
              - row /.*/
              - row /.*/
              - row /.*/
              - row /.*/
              - row /.*/
          - navigation "pagination navigation":
            - list:
              - listitem:
                - button "Go to previous page" [disabled]
              - listitem:
                - button "page 1"
              - listitem:
                - button "Go to page 2"
              - listitem:
                - button "Go to page 3"
              - listitem:
                - button "Go to page 4"
              - listitem:
                - button "Go to page 5"
              - listitem: /.*/
              - listitem:
                - button /Go to page \\d+/
              - listitem:
                - button "Go to next page"
        `);
    });



    test('login page aria snapshot', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toMatchAriaSnapshot(`
          - banner:
            - link "Blog App"
            - link "Home"
            - link "Admin Login"
            - button "toggle theme"
          - heading "Admin Panel" [level=1]
          - tablist:
            - tab "Login" [selected]
            - tab "Register"
          - tabpanel:
            - text: Username
            - textbox "Username"
            - text: Password
            - textbox "Password"
            - button "Login"
        `);
    });
});
