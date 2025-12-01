import { test, expect } from '@playwright/test';
import { waitForNetworkIdle, navigateToPage, getCurrentPageFromURL, clickNextPage, clickPreviousPage } from './helpers';

test.describe('Pagination', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to home page before each test
        await page.goto('/');
        await waitForNetworkIdle(page);
    });

    test('should navigate through multiple pages using next button', async ({ page }) => {
        // Verify we're on page 1
        let currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(1);

        // Take screenshot of page 1
        await page.screenshot({ path: 'test-results/pagination-page-1.png', fullPage: true });

        // Look for next button
        const nextButton = page.getByRole('button', { name: /next/i })
            .or(page.locator('[aria-label*="next"]'))
            .or(page.locator('button:has-text("Next")'))
            .or(page.locator('button:has-text("→")'));

        // Check if pagination exists (might not if there aren't enough posts)
        const nextButtonExists = await nextButton.count() > 0;

        if (!nextButtonExists) {
            console.log('No pagination found - not enough posts for multiple pages');
            test.skip();
            return;
        }

        // Check if next button is enabled
        const isDisabled = await nextButton.first().isDisabled().catch(() => false);

        if (isDisabled) {
            console.log('Next button is disabled - only one page of content');
            test.skip();
            return;
        }

        // Click next to go to page 2
        await nextButton.first().click();
        await waitForNetworkIdle(page);
        await page.waitForTimeout(1000);

        // Verify we're on page 2
        currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(2);

        // Verify URL contains page parameter
        expect(page.url()).toContain('page=2');

        // Take screenshot of page 2
        await page.screenshot({ path: 'test-results/pagination-page-2.png', fullPage: true });

        console.log('Successfully navigated to page 2');

        // Try to go to page 3 if possible
        if (await nextButton.first().isEnabled().catch(() => false)) {
            await nextButton.first().click();
            await waitForNetworkIdle(page);

            currentPage = await getCurrentPageFromURL(page);
            expect(currentPage).toBe(3);

            console.log('Successfully navigated to page 3');
        }
    });

    test('should navigate using previous button', async ({ page }) => {
        // Navigate to page 2 first
        await navigateToPage(page, 2);

        // Verify we're on page 2
        let currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(2);

        // Look for previous button
        const prevButton = page.getByRole('button', { name: /previous|prev/i })
            .or(page.locator('[aria-label*="previous"]'))
            .or(page.locator('button:has-text("Previous")'))
            .or(page.locator('button:has-text("←")'));

        const prevButtonExists = await prevButton.count() > 0;

        if (!prevButtonExists) {
            console.log('No previous button found');
            test.skip();
            return;
        }

        // Click previous to go back to page 1
        await prevButton.first().click();
        await waitForNetworkIdle(page);
        await page.waitForTimeout(1000);

        // Verify we're back on page 1
        currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(1);

        // Take screenshot
        await page.screenshot({ path: 'test-results/pagination-back-to-page-1.png', fullPage: true });

        console.log('Successfully navigated back to page 1');
    });

    test('should persist page state in URL', async ({ page }) => {
        // Navigate to page 2
        await navigateToPage(page, 2);

        // Verify URL contains page parameter
        expect(page.url()).toContain('page=2');

        // Get current page from URL
        const currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(2);

        // Take screenshot
        await page.screenshot({ path: 'test-results/pagination-url-state.png', fullPage: true });

        // Refresh the page
        await page.reload();
        await waitForNetworkIdle(page);

        // Verify we're still on page 2 after refresh
        const pageAfterRefresh = await getCurrentPageFromURL(page);
        expect(pageAfterRefresh).toBe(2);
        expect(page.url()).toContain('page=2');

        console.log('Page state persisted in URL after refresh');
    });

    test('should allow direct navigation to specific page via URL', async ({ page }) => {
        // Navigate directly to page 3
        await page.goto('/?page=3');
        await waitForNetworkIdle(page);

        // Verify we're on page 3
        const currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(3);

        // Verify URL is correct
        expect(page.url()).toContain('page=3');

        // Take screenshot
        await page.screenshot({ path: 'test-results/pagination-direct-page-3.png', fullPage: true });

        console.log('Successfully navigated directly to page 3 via URL');

        // Verify content loaded
        const blogPosts = page.locator('article').or(page.locator('[class*="post"]'));
        const postCount = await blogPosts.count();

        if (postCount > 0) {
            console.log(`Found ${postCount} posts on page 3`);
        }
    });

    test('should display page numbers correctly', async ({ page }) => {
        // Look for page number indicators
        const pageNumbers = page.locator('[class*="pagination"]').locator('button, a').filter({ hasText: /^\d+$/ });

        const pageNumberCount = await pageNumbers.count();

        if (pageNumberCount > 0) {
            // Verify current page is highlighted/active
            const activePage = page.locator('[class*="active"]').or(page.locator('[aria-current="page"]'));
            await expect(activePage.first()).toBeVisible();

            // Click on page number 2
            const page2Button = pageNumbers.filter({ hasText: '2' });
            if (await page2Button.count() > 0) {
                await page2Button.first().click();
                await waitForNetworkIdle(page);

                // Verify we're on page 2
                const currentPage = await getCurrentPageFromURL(page);
                expect(currentPage).toBe(2);

                console.log('Successfully clicked page number to navigate');
            }

            // Take screenshot
            await page.screenshot({ path: 'test-results/pagination-page-numbers.png', fullPage: true });
        } else {
            console.log('No page number indicators found');
        }
    });

    test('should disable previous button on first page', async ({ page }) => {
        // Ensure we're on page 1
        await page.goto('/');
        await waitForNetworkIdle(page);

        const currentPage = await getCurrentPageFromURL(page);
        expect(currentPage).toBe(1);

        // Look for previous button
        const prevButton = page.getByRole('button', { name: /previous|prev/i })
            .or(page.locator('[aria-label*="previous"]'))
            .or(page.locator('button:has-text("Previous")'))
            .or(page.locator('button:has-text("←")'));

        if (await prevButton.count() > 0) {
            // Verify previous button is disabled on first page
            const isDisabled = await prevButton.first().isDisabled();
            expect(isDisabled).toBe(true);

            console.log('Previous button is correctly disabled on first page');
        }

        // Take screenshot
        await page.screenshot({ path: 'test-results/pagination-first-page.png', fullPage: true });
    });

    test('should disable next button on last page', async ({ page }) => {
        // Navigate through pages until we find the last one
        let currentPage = 1;
        let hasNextPage = true;

        const nextButton = page.getByRole('button', { name: /next/i })
            .or(page.locator('[aria-label*="next"]'))
            .or(page.locator('button:has-text("Next")'))
            .or(page.locator('button:has-text("→")'));

        // Check if pagination exists
        if (await nextButton.count() === 0) {
            console.log('No pagination found');
            test.skip();
            return;
        }

        // Navigate to last page (max 10 iterations to prevent infinite loop)
        let iterations = 0;
        while (hasNextPage && iterations < 10) {
            const isDisabled = await nextButton.first().isDisabled().catch(() => true);

            if (isDisabled) {
                hasNextPage = false;
            } else {
                await nextButton.first().click();
                await waitForNetworkIdle(page);
                await page.waitForTimeout(500);
                currentPage++;
                iterations++;
            }
        }

        // Verify we're on the last page and next button is disabled
        const isNextDisabled = await nextButton.first().isDisabled();
        expect(isNextDisabled).toBe(true);

        // Take screenshot
        await page.screenshot({ path: 'test-results/pagination-last-page.png', fullPage: true });

        console.log(`Successfully reached last page (page ${currentPage})`);
    });

    test('should maintain search/filter state across pagination', async ({ page }) => {
        // Perform a search first
        const searchInput = page.getByPlaceholder(/search/i)
            .or(page.getByRole('searchbox'))
            .or(page.locator('input[type="search"]'));

        if (await searchInput.count() > 0) {
            await searchInput.fill('test');
            await searchInput.press('Enter');
            await waitForNetworkIdle(page);

            // Check if pagination exists with search results
            const nextButton = page.getByRole('button', { name: /next/i });

            if (await nextButton.count() > 0 && await nextButton.first().isEnabled().catch(() => false)) {
                // Navigate to page 2
                await nextButton.first().click();
                await waitForNetworkIdle(page);

                // Verify search parameter is still in URL
                expect(page.url()).toContain('test');

                // Verify we're on page 2
                const currentPage = await getCurrentPageFromURL(page);
                expect(currentPage).toBe(2);

                console.log('Search state maintained across pagination');
            } else {
                console.log('Not enough search results for pagination');
            }
        }
    });
});
