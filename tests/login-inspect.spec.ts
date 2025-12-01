import { test } from '@playwright/test';

test('login flow inspection', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);

    console.log('\n=== LOGIN PAGE ===');

    // Get all inputs with their labels
    const labels = await page.locator('label').all();
    console.log(`Labels found: ${labels.length}`);
    for (const label of labels) {
        const text = await label.textContent();
        console.log(`  Label: "${text}"`);
    }

    // Try to find inputs by label
    const usernameByLabel = page.getByLabel(/username/i);
    const passwordByLabel = page.getByLabel(/password/i);

    const usernameCount = await usernameByLabel.count();
    const passwordCount = await passwordByLabel.count();
    console.log(`\nUsername by label: ${usernameCount}, Password by label: ${passwordCount}`);

    // Fill and submit
    if (usernameCount > 0 && passwordCount > 0) {
        await usernameByLabel.fill('admin');
        await passwordByLabel.fill('admin123');

        await page.getByRole('button', { name: 'Login' }).click();
        await page.waitForTimeout(5000);

        console.log(`\nAfter login URL: ${page.url()}`);

        // Check if logged in
        const logoutBtn = await page.getByRole('button', { name: /logout/i }).count();
        const logoutLink = await page.getByRole('link', { name: /logout/i }).count();
        console.log(`Logout button: ${logoutBtn}, Logout link: ${logoutLink}`);

        // Check for admin-specific elements
        const adminText = await page.getByText(/admin/i).count();
        console.log(`"Admin" text found: ${adminText}`);

        // Check all links
        const links = await page.locator('a').all();
        console.log(`\nLinks on page:`);
        for (const link of links) {
            const text = await link.textContent();
            if (text && text.trim()) {
                console.log(`  - "${text.trim()}"`);
            }
        }
    }

    console.log('\n=== INSPECTION COMPLETE ===');
});
