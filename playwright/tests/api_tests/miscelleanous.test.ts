import { test, expect, request, APIRequestContext } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
const rootDir = path.resolve(__dirname, '../../..');
let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {

   execSync('npm run reset --workspace=server', { stdio: 'inherit', cwd: rootDir });
   execSync('npm run seed --workspace=server', { stdio: 'inherit', cwd: rootDir });

  // Temporary context to call login
  const tempContext = await playwright.request.newContext({
    baseURL: 'http://localhost:5173',
  });

  // Login with correct payload
  const loginResponse = await tempContext.post('/api/auth/login', {
    data: {
      username: 'admin',       // use 'username', not 'email'
      password: 'admin123',
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  expect(loginResponse.ok()).toBeTruthy(); // ensure login succeeded

  const loginBody = await loginResponse.json();
  const token = loginBody.token; // adjust if your API returns differently

  // Create API context with Authorization header
  apiContext = await playwright.request.newContext({
    baseURL: 'http://localhost:5173',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
});

test('Access a deleted blog via API and verify', async () => {
  const blogId = 1;

  // 1️⃣ Delete blog
  const deleteResponse = await apiContext.delete(`/api/blogs/${blogId}`);
  expect(deleteResponse.ok()).toBeTruthy();

  const deleteBody = await deleteResponse.json();
  console.log('Delete response:', deleteBody);

  // check message or status in response
  expect(deleteBody).toHaveProperty('message');
  expect(deleteBody.message).toMatch(/deleted/i);

  //Verify blog no longer exists
  const getResponse = await apiContext.get(`/api/blogs/${blogId}`);
  expect(getResponse.status()).toBe(404); // Assuming API returns 404 for missing blog
});


test('View public blog by ID and validate schema', async ({ request }) => {
  const blogId = 10;

  const response = await request.get(`/api/blogs/public/${blogId}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  // 1️⃣ Status assertion
  expect(response.status()).toBe(200);

  const body = await response.json();

  // 2️⃣ Core assertions
  expect(body).toHaveProperty('id', blogId);
  expect(body).toHaveProperty('title');
  expect(body).toHaveProperty('content');

  // 3️⃣ Type & value assertions
  expect(typeof body.title).toBe('string');
  expect(body.title.length).toBeGreaterThan(0);

  expect(typeof body.content).toBe('string');
  expect(body.content.length).toBeGreaterThan(0);

  // 4️⃣ Optional metadata assertions
  expect(body).toHaveProperty('createdAt');
  expect(body).toHaveProperty('views');
  expect(typeof body.views).toBe('number');
});


// Genuine issue invalid file returning 500 instead of a 400
test.describe('POST /api/upload – invalid file upload', () => {
  test('should reject non-image file upload', async () => {
    const response = await apiContext.post('/api/upload', {
      multipart: {
        image: {
          name: 'invalid.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('This is not an image'),
        },
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});