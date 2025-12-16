import { test, expect } from '@playwright/test';
import { getViewsCount } from '../../pages/blogDetails';
import {
    uploadImageViaClick,
    assertImageLoaded
} from '../../pages/blogEdit';
import { execSync } from 'child_process';
import path from 'path';
import { loginAdmin } from '../../pages/loginPage';
import { fuzzyClass } from '../../utils/helper';
import fs from 'fs';

const rootDir = path.resolve(__dirname, '../../..');

// 🔹 Reset + seed ONCE
test.beforeAll(() => {
        const logFile = path.join(process.cwd(), 'test-setup.log');
  
        const logStream = fs.openSync(logFile, 'a');
        execSync('npm run reset --workspace=server', {
          cwd: rootDir,
          stdio: ['ignore', logStream, logStream], // stdin, stdout, stderr
        });
  
        execSync('npm run seed --workspace=server', {
          cwd: rootDir,
          stdio: ['ignore', logStream, logStream],
        });
});

test.describe('Admin User x Edit Blog: Can @bugs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAdmin(page);
  });
     // Actual bug image removal not allowed. Even after remove and save image persists
     test('Remove and upload an image', async ({ page }) => {
        await page.goto('/admin/blog/2', { waitUntil: 'domcontentloaded' });
        // Remove Image Click
        await fuzzyClass(page,'MuiButton-colorError').click()
        await page.getByRole('button', { name: 'Save' }).click();
        await page.goto('/blog/2', { waitUntil: 'domcontentloaded' });
        const image = page.locator('img[src*="/uploads/"]');
        await expect(image).not.toBeVisible();
        await page.goto('/admin/blog/2', { waitUntil: 'domcontentloaded' });
        await uploadImageViaClick(page, 'images/dummyImage.jpeg');

        await page.getByRole('button', { name: 'Save' }).click();
        await page.goto('/blog/2', { waitUntil: 'domcontentloaded' });
        await assertImageLoaded(page);
        
    });

});

test.describe('Admin User x Blog View: Can @bugs', () => {

     // Actual bug: Views update by 2 instead of 1
test('View count is updated by 1 on refresh or changing urls', async ({ page }) => {
  // Open blog
  await page.goto('/blog/1', { waitUntil: 'domcontentloaded' });

  const initialViews = await getViewsCount(page);

  //  Refresh
  await page.reload({ waitUntil: 'domcontentloaded' });
  const viewsAfterRefresh = await getViewsCount(page);

  // Navigate to another blog and back
  await page.goto('/blog/11', { waitUntil: 'domcontentloaded' });
  await page.goto('/blog/1', { waitUntil: 'domcontentloaded' });
  const viewsAfterBlogToggle = await getViewsCount(page);

  // Back & Forward
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await page.goForward({ waitUntil: 'domcontentloaded' });
  const viewsAfterToAndFro = await getViewsCount(page);

  // ✅ Assertions (EXPECTED behavior)
expect.soft(viewsAfterRefresh).toBe(initialViews + 1);
expect.soft(viewsAfterBlogToggle).toBe(viewsAfterRefresh + 1);
expect.soft(viewsAfterToAndFro).toBe(viewsAfterBlogToggle + 1);
});


});

