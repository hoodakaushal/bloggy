import { test, expect } from '@playwright/test';

test('inspect UI elements', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get page content to inspect
    const bodyHTML = await page.content();
    console.log('=== PAGE LOADED ===');

    // Try to find blog posts with various selectors
    console.log('\n=== BLOG POST SELECTORS ===');
    const articles = await page.locator('article').count();
    console.log(`Articles found: ${articles}`);

    const divWithClass = await page.locator('div[class*="post"]').count();
    console.log(`Divs with 'post' in class: ${divWithClass}`);

    const divWithBlog = await page.locator('div[class*="blog"]').count();
    console.log(`Divs with 'blog' in class: ${divWithBlog}`);

    const divWithCard = await page.locator('div[class*="card"]').count();
    console.log(`Divs with 'card' in class: ${divWithCard}`);

    // Try to find first blog post title
    console.log('\n=== BLOG TITLES ===');
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    console.log(`H1 tags: ${h1Count}, H2 tags: ${h2Count}, H3 tags: ${h3Count}`);

    if (h2Count > 0) {
        const firstH2 = await page.locator('h2').first().textContent();
        console.log(`First H2 text: ${firstH2}`);
    }

    // Find search input
    console.log('\n=== SEARCH INPUT ===');
    const searchByPlaceholder = await page.getByPlaceholder(/search/i).count();
    console.log(`Search by placeholder: ${searchByPlaceholder}`);

    const searchInputs = await page.locator('input[type="search"]').count();
    console.log(`Input type=search: ${searchInputs}`);

    const textInputs = await page.locator('input[type="text"]').count();
    console.log(`Input type=text: ${textInputs}`);

    // Find theme toggle
    console.log('\n=== THEME TOGGLE ===');
    const themeButtons = await page.getByRole('button', { name: /theme|dark|light/i }).count();
    console.log(`Theme buttons: ${themeButtons}`);

    const allButtons = await page.locator('button').count();
    console.log(`Total buttons on page: ${allButtons}`);

    // Find login button/link
    console.log('\n=== LOGIN BUTTON ===');
    const loginButton = await page.getByRole('button', { name: /login/i }).count();
    console.log(`Login buttons: ${loginButton}`);

    const loginLink = await page.getByRole('link', { name: /login/i }).count();
    console.log(`Login links: ${loginLink}`);

    // Check for pagination
    console.log('\n=== PAGINATION ===');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const nextButton = await page.getByRole('button', { name: /next/i }).count();
    console.log(`Next buttons: ${nextButton}`);

    const prevButton = await page.getByRole('button', { name: /prev/i }).count();
    console.log(`Previous buttons: ${prevButton}`);

    // Pause for manual inspection
    await page.pause();
});
