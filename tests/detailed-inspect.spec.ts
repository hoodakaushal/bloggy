import { test } from '@playwright/test';

test('detailed DOM inspection', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Get the structure around H2 elements (blog titles)
    console.log('\n=== BLOG POST STRUCTURE ===');
    const h2Elements = page.locator('h2');
    const count = await h2Elements.count();

    for (let i = 0; i < Math.min(count, 2); i++) {
        const h2 = h2Elements.nth(i);
        const text = await h2.textContent();
        console.log(`\nBlog ${i + 1}: ${text}`);

        // Get parent elements
        const parent = h2.locator('..');
        const parentTag = await parent.evaluate(el => el.tagName);
        const parentClass = await parent.evaluate(el => el.className);
        console.log(`  Parent: <${parentTag.toLowerCase()}> class="${parentClass}"`);

        const grandparent = parent.locator('..');
        const gpTag = await grandparent.evaluate(el => el.tagName);
        const gpClass = await grandparent.evaluate(el => el.className);
        console.log(`  Grandparent: <${gpTag.toLowerCase()}> class="${gpClass}"`);
    }

    // Check login page structure
    console.log('\n=== NAVIGATING TO LOGIN ===');
    await page.getByRole('link', { name: /login/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    console.log('\n=== LOGIN FORM STRUCTURE ===');
    const usernameInput = page.locator('input').first();
    const usernameName = await usernameInput.getAttribute('name');
    const usernamePlaceholder = await usernameInput.getAttribute('placeholder');
    const usernameType = await usernameInput.getAttribute('type');
    console.log(`Username input: name="${usernameName}", placeholder="${usernamePlaceholder}", type="${usernameType}"`);

    const passwordInput = page.locator('input[type="password"]');
    const passwordName = await passwordInput.getAttribute('name');
    const passwordPlaceholder = await passwordInput.getAttribute('placeholder');
    console.log(`Password input: name="${passwordName}", placeholder="${passwordPlaceholder}"`);

    const submitButton = page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();
    console.log(`Submit button text: "${buttonText}"`);

    // Go back and check blog post page
    console.log('\n=== NAVIGATING TO BLOG POST ===');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    const firstH2 = page.locator('h2').first();
    await firstH2.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    console.log('\n=== BLOG POST PAGE STRUCTURE ===');

    // Find like button
    const likeButtons = await page.getByRole('button').all();
    console.log(`Total buttons on post page: ${likeButtons.length}`);

    for (const btn of likeButtons) {
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute('aria-label');
        console.log(`  Button: "${text?.trim()}" aria-label="${ariaLabel}"`);
    }

    // Find comment section
    const textareas = await page.locator('textarea').count();
    console.log(`\nTextareas found: ${textareas}`);

    if (textareas > 0) {
        const commentArea = page.locator('textarea').first();
        const placeholder = await commentArea.getAttribute('placeholder');
        const name = await commentArea.getAttribute('name');
        console.log(`Comment textarea: name="${name}", placeholder="${placeholder}"`);
    }

    console.log('\n=== INSPECTION COMPLETE ===');
});
