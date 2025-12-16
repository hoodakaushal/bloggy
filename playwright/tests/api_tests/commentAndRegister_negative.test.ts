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

test('Add a comment via API with wrong authorization should fail', async ({ request }) => {
  const commentPayload = {
    blogId: 2,
    content: 'This comment should not be created',
    authorName: 'admin',
  };

  // Use WRONG / invalid token
  const response = await request.post('/api/comments/author', {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer invalid.jwt.token',
    },
    data: commentPayload,
  });

  // Backend 403 (Forbidden)
  expect(403).toEqual(response.status());

  // 2️⃣ Assert error response
  const body = await response.json();

  expect(body).toHaveProperty('error');
  expect(body.error.toLowerCase()).toMatch(
    /unauthorized|invalid|token|expired/
  );

  console.log('API correctly rejected comment with wrong auth:', {
    status: response.status(),
    body,
  });
});

test('Public comment fails with missing content (no auth)', async ({ request }) => {
  const response = await request.post('/api/comments', {
    data: {
      blogId: 2,
      // content missing
      authorName: 'John'
    }
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body).toHaveProperty('error');
});


test('Public comment fails with missing author (no auth)', async ({ request }) => {
  const response = await request.post('/api/comments', {
    data: {
      blogId: 2,
      content: 'jj',
    }
  });

  expect(response.status()).toBe(400);
});



test('Add a comment via API exceeding max length should fail', async () => {
  const longContent = 'A'.repeat(2001); // 2001 chars, exceeding limit

  const commentPayload = {
    blogId: 2,
    content: longContent,
    authorName: 'admin',
  };

  // Attempt to add comment
  const response = await apiContext.post('/api/comments/author', {
    data: commentPayload,
  });

  // Assert status code is 400
  expect(response.status()).toBe(400);

  // Assert error message
  const body = await response.json();
  expect(body).toHaveProperty('error');
  expect(body.error).toBe('Comment cannot exceed 2000 characters');

  console.log('API correctly rejected comment exceeding max length:', body);
});


test.describe('POST /api/auth/register – duplicate user', () => {
  test('should fail when registering an already existing user', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        username: 'admin',      // already seeded user
        password: 'admin12',
      },
    });

    // ✅ Expected behavior
    expect(409).toEqual(response.status());

    const body = await response.json();

    // Defensive assertions (backend-dependent)
    expect(body).toHaveProperty('error');
  });
});