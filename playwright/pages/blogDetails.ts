import { Page, expect } from '@playwright/test';

export async function verifyBlogContent(page: Page, expectedHeadings: string[]) {
  // Select blog container by stable element — the <div> containing the blog
  const blogContent = page.locator('div:has(> h2)');

  for (const text of expectedHeadings) {
    await expect(blogContent).toContainText(text);
  }
}

export async function getLikes(page: Page) {
    const text = await page.getByText(/likes$/).innerText(); 
    const number = parseInt(text.split(' ')[0], 10); // always specify radix
    return number;
}

export async function clickLike(page: Page) {
  const likeButton = page.locator('button:has(svg[data-testid="ThumbUpIcon"])');
  await likeButton.click();
}

export async function getTotalComments(page: Page): Promise<number> {
  // Locate the comments list
  const commentsList = page.locator('ul:has(li)'); // selects the <ul> that has <li> children
  // Count the number of <li> items
  const count = await commentsList.locator('li').count();
  return count;
}

export async function setCommentTitle(page: Page, title: string) {
  // Locate input by type="text" and required attribute
  const titleInput = page.locator('input[type="text"][required]');
  await titleInput.fill(title);
}

export async function setCommentBody(page: Page, body: string) {
  // Locate textarea by required attribute
  const bodyTextarea = page.locator('textarea[required]');
  await bodyTextarea.fill(body);
}

export async function postComment(page: Page) {
  await page.locator('button[type=submit]').click();
}

export async function validateLatestComment(
    page: Page,
  expectedTitle: string,
  expectedBody: string
) {
const titleLocator = page.locator('h6[class*="MuiTypography-subtitle2"]').first();
    await expect(titleLocator).toHaveText(expectedTitle);
    const comment = page.locator('p', { hasText: expectedBody });
  await expect(comment).toBeVisible();

}