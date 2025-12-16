import { test, expect } from '@playwright/test';

import {
    fillBlogForm,
    selectTags,
    selectCategory,
    uploadImageViaClick,
    assertImageLoaded,
    typeBoldTextAndAssert,
    typeItalicTextAndAssert,
    typeUnderlineTextAndAssert,
    typeStrikeTextAndAssert,
    clickSaveButton,
    fillTitle,
    fillDescription,
    typeOrderedList,
    typeBulletList,
    typeBulletListAndAssert,
    typeOrderedListAndAssert,
    typeColoredTexttAndAssert,
    typeBackgroundColoredTextAndAssert,
    uploadImageToEditorAndAssert,
    insertLinkIntoEditorAndAssert,
    typeTextWithAllHeadersAndAssert,
    clearFormatting,

} from '../../pages/blogEdit';

import {
    blogActionByTitle,
    clickNewBlogPost
} from '../../pages/blogListing';
import { execSync } from 'child_process';
import path from 'path';
import { loginAdmin } from '../../pages/loginPage';

const rootDir = path.resolve(__dirname, '../../..');

// 🔹 Reset + seed ONCE
test.beforeAll(() => {
  execSync('npm run reset --workspace=server', { stdio: 'inherit', cwd: rootDir });
  execSync('npm run seed --workspace=server', { stdio: 'inherit', cwd: rootDir });
});

test.describe('Admin User x Create Blog:', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAdmin(page);
  });


test('Test Header Options Text', async ({ page }) => {
  // Reusable strings
  const blogTitle = 'Test Header Options Text';
  const blogDescription = 'Dummy';
  const category = 'Programming';

  await clickNewBlogPost(page);
  await fillTitle(page, blogTitle);
  await fillDescription(page, blogDescription);
  await typeTextWithAllHeadersAndAssert(page);
  await selectCategory(page, category);
  await page.locator('button[value="published"]').click();
  await clickSaveButton(page);
  await blogActionByTitle(page, blogTitle, 'View');

});

test('Test Bold, Italics, Underline and Strike Through', async ({ page }) => {
  // Reusable strings
  const blogTitle = 'Test Bold, Italics, Underline and Strike Through';
  const blogDescription = 'Dummy';
  const boldText = 'This is bold text';
  const italicText = 'This is italic text';
  const underlineText = 'This is underlined text';
  const strikeText = 'This is struck text';
  const category = 'Programming';

  await clickNewBlogPost(page);

  await fillTitle(page, blogTitle);
  await fillDescription(page, blogDescription);

  // Type and assert rich text
  await typeBoldTextAndAssert(page);           // types and asserts boldText internally
  await typeItalicTextAndAssert(page, italicText);
  await typeUnderlineTextAndAssert(page);      // types and asserts underlineText internally
  await typeStrikeTextAndAssert(page);         // types and asserts strikeText internally

  await selectCategory(page, category);
  await page.locator('button[value="published"]').click();
  await clickSaveButton(page);

  await blogActionByTitle(page, blogTitle, 'View');

  // Assertions for all text styles
  await expect(page.locator('strong')).toContainText(boldText);
  await expect(page.locator('em')).toContainText(italicText);
  await expect(page.locator('u')).toContainText(underlineText);
  await expect(page.locator('s')).toContainText(strikeText);
});

test('Test Ordered and Bullet Lists', async ({ page }) => {
  // Reusable strings
  const blogTitle = 'Test Ordered and Bullet Lists';
  const blogDescription = 'Dummy description';
  const orderedItems = ['First ordered item', 'Second ordered item', 'Third ordered item'];
  const bulletItems = ['First bullet item', 'Second bullet item', 'Third bullet item'];
  const category = 'Programming';

  await clickNewBlogPost(page);

  await fillTitle(page, blogTitle);
  await fillDescription(page, blogDescription);

  // Type ordered list
  await typeOrderedListAndAssert(page);

  // Type bullet list
  await typeBulletListAndAssert(page);

  await selectCategory(page, category);
  await page.locator('button[value="published"]').click();
  await clickSaveButton(page);

  await blogActionByTitle(page, blogTitle, 'View');

for (const item of orderedItems) {
  await expect(page.locator(`ol li`, { hasText: item })).toHaveCount(1);
}

for (const item of bulletItems) {
  await expect(page.locator(`ul li`, { hasText: item })).toHaveCount(1);
}

});

test('Test Color and Colored Background Text', async ({ page }) => {
  // Reusable strings
  const blogTitle = 'Test Color and Colored Background Text';
  const blogDescription = 'Dummy';
  const category = 'Programming';

  await clickNewBlogPost(page);
  await fillTitle(page, blogTitle);
  await fillDescription(page, blogDescription);
  await typeColoredTexttAndAssert(page);
  await typeBackgroundColoredTextAndAssert(page);
  await selectCategory(page, category);
  await page.locator('button[value="published"]').click();
  await clickSaveButton(page);
  await blogActionByTitle(page, blogTitle, 'View');

  // Red text
const redText = page.locator('span', { hasText: 'This text is red' });
await expect(redText).toHaveCount(1);

// Assert the color is red
await expect(redText).toHaveAttribute(
  'style',
  /color:\s*rgb\(230,\s*0,\s*0\)/
);

// Red background text
const redBgText = page.locator('span', { hasText: 'This text has red background' });
await expect(redBgText).toHaveCount(1);

// Assert background color is red
const bgColor = await redBgText.evaluate(el => getComputedStyle(el).backgroundColor);
expect(bgColor).toBe('rgb(230, 0, 0)');

});


test('Test Image Upload', async ({ page }) => {
  // Reusable strings
  const blogTitle = 'Test Image Upload and Link Insert';
  const blogDescription = 'Dummy';
  const category = 'Programming';

  await clickNewBlogPost(page);
  await fillTitle(page, blogTitle);
  await fillDescription(page, blogDescription);
  await uploadImageToEditorAndAssert(page,'images/dummyImage.jpeg');
  await selectCategory(page, category);
  await page.locator('button[value="published"]').click();
  await clickSaveButton(page);
  await blogActionByTitle(page, blogTitle, 'View');
  // Locate the image by <img> tag
const image = page.locator('img[src^="data:image/"]');

// Assert the image exists and is visible
await expect(image).toHaveCount(1);
await expect(image).toBeVisible();

// check if the image is actually loaded
const isLoaded = await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
expect(isLoaded).toBe(true);
});

test('Test Link Insert', async ({ page }) => {
  // Reusable strings
  const blogTitle = 'Test Image Upload and Link Insert';
  const blogDescription = 'Dummy';
  const category = 'Programming';

  await clickNewBlogPost(page);
  await fillTitle(page, blogTitle);
  await fillDescription(page, blogDescription);
  await insertLinkIntoEditorAndAssert(page);
  await selectCategory(page, category);
  await page.locator('button[value="published"]').click();
  await clickSaveButton(page);
  await blogActionByTitle(page, blogTitle, 'View');
  const link = page.locator('a[href="https://example.com"]');
    // Assert link is visible
    await expect(link).toBeVisible();

    // Assert link text
    await expect(link).toHaveText('This is a link')
});


test('Test Clean Editor ', async ({ page }) => {
  // Reusable strings
  page.goto('/admin/blog/1')

 const editor = page.locator('.ql-editor');

// Assert h2 is visible
const h2 = editor.locator('h2');
await expect(h2).toBeVisible();

 await clearFormatting(page);
await expect(h2).not.toBeVisible();
});


});
