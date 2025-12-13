// Will verify blog content via this curl http://localhost:3001/api/blogs/public/1
// View updates by 2 should be written in failing cases, Reload case, navigate forward, back

import { test, expect } from '@playwright/test';
import {
  openAndSelectCategoryDropdown,
  searchBlogs,
  clearSearchBlogs,
  getBlogRows,
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
  validateLatestComment
} from '../../pages/blogDetails';

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = path.resolve(__dirname, '../../..');

test.describe('Public User Blog Details: User can ', () => {

  // Run reset + seed ONCE before all tests
  test.beforeAll(() => {
    execSync('npm run reset --workspace=server', { stdio: 'inherit', cwd: rootDir });
    execSync('npm run seed --workspace=server', { stdio: 'inherit', cwd: rootDir });
  });

  // Before each test: go to homepage & open blog
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clickReadMoreForBlog(page, 'Getting Started with TypeScript');
  });


  test('View read more and view blogs', async ({ page }) => {
    await verifyBlogContent(page, [
      'Introduction to TypeScript',
      'Why TypeScript?',
      'Basic Types',
      'Conclusion'
    ]);
  });

  test('Like on Blogs', async ({ page }) => {
    const likesBefore = await getLikes(page);

    await clickLike(page);

    await page.waitForResponse(res =>
      res.url().includes('/api/blogs/1/like') && res.status() === 200
    );

    await expect(async () => {
      const likesAfter = await getLikes(page);
      expect(likesAfter).toBe(likesBefore + 1);
    }).toPass({ timeout: 5000 });
  });

  test('Comment on Blogs', async ({ page }) => {

    // load mock JSON BEFORE page makes request
    const filePath = path.join(__dirname, '../../fixtures/commentReload.json');
    const mockData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    await page.route('**/comments/blog/1', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });

    await page.goto('/blog/1');

    const totalComments = await getTotalComments(page);

    await setCommentTitle(page, 'Great Article!');
    await setCommentBody(page, 'This tutorial helped me understand TypeScript better.');
    await postComment(page);

    await expect(async () => {
      const totalCommentsAfter = await getTotalComments(page);
      expect(totalCommentsAfter).toBe(totalComments + 1);
    }).toPass({ timeout: 5000 });

    await validateLatestComment(
      page,
      'Ojas',
      'What is this'
    );
  });

});
