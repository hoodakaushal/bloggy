// Will verify blog content via this curl http://localhost:3001/api/blogs/public/1

import { test, expect } from '@playwright/test';
import { openAndSelectCategoryDropdown, searchBlogs, clearSearchBlogs, getBlogRows, clickReadMoreForBlog } from '../../pages/homePage';
import { verifyBlogContent, getLikes, clickLike, getTotalComments, setCommentTitle, setCommentBody, postComment, validateLatestComment } from '../../pages/blogDetails';
import { execSync } from 'child_process';

test.describe('Public User Blog Details: User can ', () => {

test.beforeEach(async ({ page }) => {
  execSync('npm run reset && npm run seed', { stdio: 'inherit' });
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
  page.waitForResponse(res =>
    res.url().includes('/api/blogs/1/like') &&
    res.status() === 200
  )
    // Wait for the likes text to update
  await expect(async () => {
    const likesAfter = await getLikes(page);
    expect(likesAfter).toBe(likesBefore + 1);
  }).toPass({ timeout: 5000 }); // wait up to 3 seconds for UI update
});


test('Comment on Blogs', async ({ page }) => {
const totalComments = await getTotalComments(page);
await setCommentTitle(page, 'Great Article!');
await setCommentBody(page, 'This tutorial helped me understand TypeScript better.');
await postComment(page);
  page.waitForResponse(res =>
    res.url().includes('/api/comments') &&
    res.status() === 201
  )
    // Wait for the likes text to update
  await expect(async () => {
    const totalCommentsAfter = await getTotalComments(page);
    expect(totalCommentsAfter).toBe(totalComments + 1);
  }).toPass({ timeout: 5000 }); // wait up to 3 seconds for UI update
  await validateLatestComment(
  page,
  'Great Article!',
  'This tutorial helped me understand TypeScript better.'
);
});
});