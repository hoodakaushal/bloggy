import { test } from '@playwright/test';

test('blog post and admin inspection', async ({ page }) => {
    // Go to a specific blog post
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // Click "Read More" button
    console.log('\n=== CLICKING READ MORE ===');
    const readMoreBtn = page.getByRole('button', { name: 'Read More' }).first();
    await readMoreBtn.click();
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`Current URL: ${url}`);

    console.log('\n=== BLOG POST PAGE ===');
    const h1 = await page.locator('h1').textContent();
    console.log(`H1: ${h1}`);

    // Find like button
    const buttons = await page.locator('button').all();
    console.log(`\nButtons on page:`);
    for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.trim()) {
            console.log(`  - "${text.trim()}"`);
        }
    }

    // Find comment section
    const textareas = await page.locator('textarea').count();
    const inputs = await page.locator('input').count();
    console.log(`\nTextareas: ${textareas}, Inputs: ${inputs}`);

    // Check for comment form
    const commentForm = await page.locator('form').count();
    console.log(`Forms: ${commentForm}`);

    // Login and check admin features
    console.log('\n=== LOGGING IN AS ADMIN ===');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(1000);

    // Fill login form
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForTimeout(2000);

    console.log(`After login URL: ${page.url()}`);

    // Navigate to Dashboard
    console.log('\n=== NAVIGATING TO DASHBOARD ===');
    await page.getByRole('button', { name: /dashboard/i }).or(page.getByRole('link', { name: /dashboard/i })).click();
    await page.waitForTimeout(1000);

    // Navigate to Create Post
    console.log('\n=== NAVIGATING TO CREATE POST ===');
    await page.getByRole('button', { name: /create|new/i }).or(page.getByRole('link', { name: /create|new/i })).click();
    await page.waitForTimeout(2000);
    console.log(`Create post URL: ${page.url()}`);

    // Inspect Category Select
    console.log('\n=== INSPECTING CATEGORY SELECT ===');
    const categoryLabel = page.getByLabel(/category/i);
    const categorySelect = page.locator('.MuiSelect-select');
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });

    console.log(`Category Label count: ${await categoryLabel.count()}`);
    console.log(`Category Select (.MuiSelect-select) count: ${await categorySelect.count()}`);
    console.log(`Category Combobox count: ${await categoryCombobox.count()}`);

    if (await categorySelect.count() > 0) {
        console.log(`Category Select HTML: ${await categorySelect.first().evaluate(el => el.outerHTML)}`);
    }

    // Inspect Publish Button
    console.log('\n=== INSPECTING PUBLISH BUTTON ===');
    const publishBtn = page.getByRole('button', { name: /publish/i });
    const publishBtnXPath = page.locator('(//button[contains(text(),"Publish")])[2]');

    console.log(`Publish Button (Role) count: ${await publishBtn.count()}`);
    console.log(`Publish Button (XPath) count: ${await publishBtnXPath.count()}`);

    if (await publishBtn.count() > 0) {
        console.log(`Publish Button (Role) HTML: ${await publishBtn.first().evaluate(el => el.outerHTML)}`);
        console.log(`Publish Button (Role) Disabled: ${await publishBtn.first().isDisabled()}`);
    }

    if (await publishBtnXPath.count() > 0) {
        console.log(`Publish Button (XPath) HTML: ${await publishBtnXPath.first().evaluate(el => el.outerHTML)}`);
        console.log(`Publish Button (XPath) Disabled: ${await publishBtnXPath.first().isDisabled()}`);
    }

    console.log('\n=== INSPECTION COMPLETE ===');
});
