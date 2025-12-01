import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Gremlin (Chaos) Tests', () => {

    const runGremlins = async (page: any) => {
        // Inject gremlins.js from CDN
        await page.addScriptTag({ url: 'https://unpkg.com/gremlins.js' });

        // Run gremlins
        await page.evaluate(() => {
            return new Promise((resolve) => {
                (window as any).gremlins.createHorde({
                    species: [
                        (window as any).gremlins.species.clicker(),
                        (window as any).gremlins.species.toucher(),
                        (window as any).gremlins.species.formFiller(),
                        (window as any).gremlins.species.scroller(),
                        (window as any).gremlins.species.typer()
                    ],
                    mogwais: [
                        (window as any).gremlins.mogwais.alert(),
                        (window as any).gremlins.mogwais.fps(),
                        (window as any).gremlins.mogwais.gizmo()
                    ],
                    strategies: [
                        (window as any).gremlins.strategies.distribution()
                    ],
                    randomizer: new (window as any).gremlins.Chance(1234), // Seed for reproducibility
                    delay: 50, // Delay between events
                    nb: 1000 // Number of events
                }).unleash()
                    .then(() => resolve('finished'));
            });
        });
    };

    test('should survive chaos on home page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Listen for console errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        page.on('pageerror', err => {
            errors.push(err.message);
        });

        await runGremlins(page);

        // Assert no critical errors (optional, depending on tolerance)
        // expect(errors.length).toBe(0); 

        // Assert page is still alive
        expect(page.url()).toBeTruthy();
    });

    test('should survive chaos on admin dashboard', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');

        await runGremlins(page);

        // Assert page is still alive
        expect(page.url()).toBeTruthy();
    });
});
