import { Page, expect } from '@playwright/test';
import { fuzzyClass } from '../utils/helper';
import path from 'path';
import os from 'os';


const EDITOR_SELECTOR = '.ql-editor';

//  Fill Title
export async function fillTitle(page: Page, title: string) {
  const titleInput = page.locator('input.MuiOutlinedInput-input');
  await titleInput.clear();
  await titleInput.fill(title);
  await expect(titleInput).toHaveValue(title);
}

//  Fill Description
export async function fillDescription(page: Page, description: string) {
  const descriptionTextarea = page.getByRole('textbox', { name: 'Excerpt' });
  await descriptionTextarea.clear();
  await descriptionTextarea.fill(description);
  await expect(descriptionTextarea).toHaveValue(description);
}

// Fill Rich Text Editor
export async function fillContentEditor(page: Page, content: string) {
  const editor = page.locator(EDITOR_SELECTOR);
  await editor.click();


  const isMac = os.platform() === 'darwin';
  const modifierKey = isMac ? 'Meta' : 'Control';
  // Use keyboard since fill() doesn't work for contenteditable
  await page.keyboard.press(`${modifierKey}+A`);
  await page.keyboard.press('Backspace');
  await page.keyboard.type(content);

  await expect(editor).toContainText(content);
}

// Combined method
export async function fillBlogForm(
  page: Page,
  data: {
    title: string;
    description: string;
    content: string;
  }
) {
  await fillTitle(page, data.title);
  await fillDescription(page, data.description);
  await fillContentEditor(page, data.content);
}


export async function uploadImageViaClick(
  page: Page,
  filePath: string
) {
  const input = page.locator('input[type="file"]');

  await expect(input).toHaveCount(1);
  await input.setInputFiles(filePath);
}


export async function assertImageLoaded(
  page: Page,
) {
  const image = page.locator('img[src*="/uploads/"]');

  // Image exists & visible
  await expect(image).toBeVisible();

  // Image is actually loaded (not broken)
  const isLoaded = await image.evaluate(
    (img: HTMLImageElement) =>
      img.complete && img.naturalWidth > 0
  );

  expect(isLoaded).toBe(true);
}

export async function selectTags(
  page: Page,
  tags: string[]
) {
  // Open the Tags multi-select
  const tagsDropdown = page
    .locator('label', { hasText: 'Tags' })
    .locator('..')
    .getByRole('combobox');

  await expect(tagsDropdown).toBeVisible();
  await tagsDropdown.click();

    for (const tag of tags) {
    await page.locator(`li[data-value="${tag}"]`).click();
    }
  // Close dropdown (required for MUI multi-select)
  await page.keyboard.press('Escape');
}

export async function selectCategory(
  page: Page,
  categoryValue: string
) {
  // Open Category dropdown via label
  const categoryDropdown = page
    .locator('label', { hasText: 'Category' })
    .locator('..')
    .getByRole('combobox');

  await expect(categoryDropdown).toBeVisible();
  await categoryDropdown.click();

  // Select category by value (stable for MUI)
  await page.locator(`li[data-value="${categoryValue}"]`).click();
}

export async function typeTextWithAllHeadersAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const headerPicker = page.locator('.ql-header .ql-picker-label');

  const headers = [
    { label: 'H1', value: '1', text: 'Heading 1 Text' },
    { label: 'H2', value: '2', text: 'Heading 2 Text' },
    { label: 'H3', value: '3', text: 'Heading 3 Text' },
    { label: 'Normal', value: null, text: 'Normal Text' },
  ];

  await editor.waitFor({ state: 'visible' });
  await editor.click();

  for (const header of headers) {
    await headerPicker.click();

    if (header.value) {
      // Directly select header by data-value
      await page.locator(`.ql-header .ql-picker-item[data-value="${header.value}"]`).click();
    } else {
      // Normal text (no data-value)
      await page.locator('.ql-header .ql-picker-item:not([data-value])').click();
    }

    const typedText = `${header.label}: ${header.text}`;
    await editor.type(typedText);
    await page.keyboard.press('Enter');

    await expect(editor).toContainText(typedText);
  }
}


export async function typeBoldTextAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);

  // Toggle Bold
  await page.locator('.ql-bold').click();

  // Type text
  const text = 'This is bold text';
  await editor.type(text);
  await page.keyboard.press('Enter');

  // Toggle Bold off
  await page.locator('.ql-bold').click();

  // Assert
  await expect(editor.locator('strong')).toContainText(text);
}

export async function typeItalicTextAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const text = 'This is italic text';

  await page.locator('.ql-italic').click();
  await editor.type(text);
  await page.keyboard.press('Enter');
  await page.locator('.ql-italic').click();

  await expect(editor.locator('em')).toContainText(text);
}

export async function typeUnderlineTextAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const text = 'This is underlined text';

  await page.locator('.ql-underline').click();
  await editor.type(text);
  await page.keyboard.press('Enter');
  await page.locator('.ql-underline').click();

  await expect(editor.locator('u')).toContainText(text);
}

export async function typeStrikeTextAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const text = 'This is struck text';

  await page.locator('.ql-strike').click();
  await editor.type(text);
  await page.keyboard.press('Enter');
  await page.locator('.ql-strike').click();

  await expect(editor.locator('s')).toContainText(text);
}

export async function typeBulletList(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);

  // Enable bullet list
  await page.locator('.ql-list[value="bullet"]').click();

  await editor.click();
  await editor.type('First bullet item');
  await page.keyboard.press('Enter');

  await editor.type('Second bullet item');
  await page.keyboard.press('Enter');

  await editor.type('Third bullet item');
  await page.keyboard.press('Enter');

  // Disable list
  await page.locator('.ql-list[value="bullet"]').click();
}

export async function typeOrderedListAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const items = ['First ordered item', 'Second ordered item', 'Third ordered item'];

  // Enable ordered list
  await page.locator('.ql-list[value="ordered"]').click();

  await editor.click();
  for (const item of items) {
    await editor.type(item);
    await page.keyboard.press('Enter');
  }

  // Disable list
  await page.locator('.ql-list[value="ordered"]').click();

  // Assert ordered list items
  for (const item of items) {
    const li = editor.locator('ol li', { hasText: item });
    await expect(li).toHaveCount(1);
  }
}

export async function typeBulletListAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const items = ['First bullet item', 'Second bullet item', 'Third bullet item'];

  // Enable bullet list
  await page.locator('.ql-list[value="bullet"]').click();

  await editor.click();
  for (const item of items) {
    await editor.type(item);
    await page.keyboard.press('Enter');
  }

  // Disable list
  await page.locator('.ql-list[value="bullet"]').click();

  // Assert bullet list items
  for (const item of items) {
    const li = editor.locator('ul li', { hasText: item });
    await expect(li).toHaveCount(1);
  }
}


export async function typeColoredTexttAndAssert(
  page: Page,
  text = 'This text is red',
  colorHex = '#e60000' // 🔴 default = red
) {
  const editor = page.locator(EDITOR_SELECTOR);
  const colorPicker = page.locator('.ql-color .ql-picker-label');

  const colorOption = page.locator(
    `.ql-color .ql-picker-item[data-value="${colorHex}"]`
  );

  // Open color picker
  await colorPicker.click();

  // Select color
  await expect(colorOption).toBeVisible();
  await colorOption.click();

  // Type text
  await editor.click();
  await editor.type(text);
  await page.keyboard.press('Enter');

  // Assert exact color applied
  const coloredText = editor.locator('span', { hasText: text });

  await expect(coloredText).toHaveAttribute(
    'style',
    new RegExp(`color:\\s*(rgb\\(|${colorHex})`)
  );
}

export async function typeBackgroundColoredTextAndAssert(
  page: Page,
  text = 'This text has red background',
  bgColorHex = '#e60000' // 🔴 default background
) {
  const editor = page.locator(EDITOR_SELECTOR);

  // Background color picker (Quill-specific, stable)
  const bgPickerLabel = page.locator('.ql-background .ql-picker-label');

  const bgColorOption = page.locator(
    `.ql-background .ql-picker-item[data-value="${bgColorHex}"]`
  );

  // Open background color picker
  await bgPickerLabel.click();

  // Choose background color
  await expect(bgColorOption).toBeVisible();
  await bgColorOption.click();

  // Type text
  await editor.click();
  await editor.type(text);
  await page.keyboard.press('Enter');

  // Locate the highlighted text
  const highlightedText = editor.locator('span', { hasText: text });

  // ✅ Assert background color applied
  const backgroundColor = await highlightedText.evaluate(el =>
    getComputedStyle(el).backgroundColor
  );

  expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
}

export async function clearFormatting(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);

  // Quill "Clear formatting" button
  const clearButton = page.locator('button.ql-clean');

  // Ensure editor has focus & content
  await expect(editor).toBeVisible();
  await editor.click();

  // Select all content (Cmd+A on macOS, Ctrl+A otherwise)
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');

  // Click "Clear formatting"
  await expect(clearButton).toBeVisible();
  await clearButton.click();
}


export async function uploadImageToEditorAndAssert(
  page: Page,
  imagePath: string
) {
  const editor = page.locator(EDITOR_SELECTOR);
  const imageButton = page.locator('button.ql-image');

  // Focus editor
  await expect(editor).toBeVisible();
  await editor.click();

  // Quill creates a hidden <input type="file"> when image button is clicked
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    imageButton.click(),
  ]);

  // Upload image
  await fileChooser.setFiles(path.resolve(imagePath));

  // Assert image inserted into editor
  const image = editor.locator('img');

  await expect(image).toHaveCount(1);
  await expect(image).toBeVisible();
}

export async function insertLinkIntoEditorAndAssert(page: Page) {
  const editor = page.locator(EDITOR_SELECTOR);
  const linkButton = page.locator('button.ql-link');

  // Type text
  await expect(editor).toBeVisible();
  await editor.click();
  await editor.fill('This is a link');

  // Select all text using DOM Range (cross-platform)
  await page.evaluate(() => {
    const editorEl = document.querySelector('.ql-editor');
    if (editorEl) {
      const range = document.createRange();
      range.selectNodeContents(editorEl);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  });

  // Apply link
  await linkButton.click();

  page.locator('input[placeholder="https://quilljs.com"]').fill('https://example.com');
  page.locator('a.ql-action').click();

  // Assert link applied
  const link = editor.locator('a[href="https://example.com"]');
  await expect(link).toBeVisible();
  await expect(link).toHaveText('This is a link');
}


export async function clickSaveButton(page: Page) {
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/^https?:\/\/.*\/admin$/);
}