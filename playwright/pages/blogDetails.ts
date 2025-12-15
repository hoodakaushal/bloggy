import { Page, expect, Locator } from '@playwright/test';
import { fuzzyClass } from '../utils/helper';

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

export function getLikeButton(page: Page): Locator {
  return  page.locator('button:has(svg[data-testid="ThumbUpIcon"])');
}

export async function clickLike(page: Page) {
  await getLikeButton(page).click()
}

export async function checkLikeDisabled(page: Page) {
  await expect(getLikeButton(page)).toBeDisabled();
}

export async function getTotalComments(page: Page): Promise<number> {
  const count = await fuzzyClass(page,'MuiListItemText-root').count();
  return count;
}

export async function setCommentUser(page: Page, user: string) {
  // Locate input by type="text" and required attribute
  const userInput = page.locator('input[type="text"][required]');
  await userInput.fill(user);
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
  expectedUser: string,
  expectedBody: string
) {

if (expectedUser === 'admin') {
    // Custom assertion for admin
    await assertCommentAdmin(page);
  } else {
    // Assert for regular user
    await expect(
      page.getByRole('heading', { name: expectedUser })
    ).toBeVisible();
  }

await expect(
  page.getByText(expectedBody)
).toBeVisible();
}

export async function getViewsCount(page: Page): Promise<number> {
  const viewsText = await page
    .locator('p.MuiTypography-body2')
    .filter({ hasText: /views/i })
    .first()
    .textContent();

  return Number(viewsText?.match(/\d+/)?.[0]);
}

export async function assertCommentAdmin(
  page: Page,
) {
  // Locate the comment container by its text
  const commentItem = page.locator('li', { hasText: 'admin' });

  // Assert author name
  await expect(
  commentItem.getByRole('heading', { name: 'admin', exact: true }).first()
).toBeVisible();


// Assert that there are exactly 2 role chips
await expect(commentItem.locator('.MuiChip-label')).toHaveCount(2);

// Assert the first one has text "Author"
await expect(commentItem.locator('.MuiChip-label').first()).toHaveText('Author');

}