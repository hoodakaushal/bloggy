// Will verify blog content via this curl http://localhost:3001/api/blogs/public/1
// View updates by 2 should be written in failing cases, Reload case, navigate forward, back

import { test, expect } from '@playwright/test';
import {
  clickReadMoreForBlog
} from '../../pages/homePage';
import {
  verifyBlogContent,
  getLikes,
  clickLike,
  getTotalComments,
  setCommentTitle,
  setCommentBody,
  postComment,
  validateLatestComment,
  checkLikeDisabled
} from '../../pages/blogDetails';

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { loginAdmin } from '../../pages/loginPage';

type UserScenario = {
  title: string;
  isAdmin: boolean;
};

const scenarios: UserScenario[] = [
  { title: 'Public User', isAdmin: false },
  { title: 'Admin User', isAdmin: true },
];

const rootDir = path.resolve(__dirname, '../../..');


for (const { title, isAdmin } of scenarios) {
  test.describe(`${title} Blog Details: User can`, () => {

    // 🔹 Reset + seed ONCE
    test.beforeAll(() => {
  execSync('npm run reset --workspace=server', { stdio: 'inherit', cwd: rootDir });
  execSync('npm run seed --workspace=server', { stdio: 'inherit', cwd: rootDir });
  
    });


    // 🔹 Setup per test
    test.beforeEach(async ({ page }) => {
      await page.goto('/');

      if (isAdmin) {
        await loginAdmin(page);
        await page.goto('/');
      }

      await clickReadMoreForBlog(page, 'Getting Started with TypeScript');
    });

    test('View read more and view blogs', async ({ page }) => {
      await verifyBlogContent(page, [
        'Introduction to TypeScript',
        'Why TypeScript?',
        'Basic Types',
        'Conclusion',
      ]);
    });

test('Like on Blogs', async ({ page }) => {
  const likesBefore = await getLikes(page);

  // First like
  await Promise.all([
    page.waitForResponse(res =>
      res.url().includes('/api/blogs/1/like') && res.status() === 200
    ),
    clickLike(page),
  ]);

  await expect(async () => {
    const likesAfter = await getLikes(page);
    expect(likesAfter).toBe(likesBefore + 1);
  }).toPass({ timeout: 5000 });

  await checkLikeDisabled(page);

  // Reload and like again
  await test.step('Likes are allowed on reload', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });

    await Promise.all([
      page.waitForResponse(res =>
        res.url().includes('/api/blogs/1/like') && res.status() === 200
      ),
      clickLike(page),
    ]);

    await expect(async () => {
      const likesAfterReload = await getLikes(page);
      expect(likesAfterReload).toBe(likesBefore + 2);
    }).toPass({ timeout: 5000 });
  });
});


    test('Comment on Blogs', async ({ page }) => {

      await page.goto('/blog/1');

      const totalComments = await getTotalComments(page);

      await setCommentTitle(page, 'Great Article!');
      await setCommentBody(
        page,
        'This tutorial helped me understand TypeScript better.'
      );
      await postComment(page);

      await validateLatestComment(
        page,
        'Great Article!',
        'This tutorial helped me understand TypeScript better.'
      );

      await expect(async () => {
        const totalCommentsAfter = await getTotalComments(page);
        expect(totalCommentsAfter).toBe(totalComments + 1);
      }).toPass({ timeout: 5000 });

     
    });

  });
}
