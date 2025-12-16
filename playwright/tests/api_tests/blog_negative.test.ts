import { test, expect, request, APIRequestContext } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = path.resolve(__dirname, '../../..');
let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {

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
  // Temporary context to call login
  const tempContext = await playwright.request.newContext({
    baseURL: 'http://localhost:3001',
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


test.describe('POST /api/blogs – validation errors', () => {
  // Status is defaulted to draft so doesn't fail
  test('should fail when title is missing', async () => {
    const response = await apiContext.post('/api/blogs', {
      data: {
        content: '<p>Valid content</p>',
        excerpt: 'Excerpt',
        category: 'Technology',
        tags: [],
        status: 'published',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('should fail when content is missing', async () => {
    const response = await apiContext.post('/api/blogs', {
      data: {
        title: 'Missing Content',
        excerpt: 'Excerpt',
        category: 'Technology',
        tags: [],
        status: 'published',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('should fail when category is missing', async () => {
    const response = await apiContext.post('/api/blogs', {
      data: {
        title: 'Missing Category',
        content: '<p>Valid content</p>',
        excerpt: 'Excerpt',
        tags: [],
        status: 'published',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('should fail when Excerpt is missing', async () => {
    const response = await apiContext.post('/api/blogs', {
      data: {
        title: 'Missing Status',
        content: '<p>Valid content</p>',
        category: 'Technology',
        tags: [],
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('should fail when multiple required fields are missing', async () => {
    const response = await apiContext.post('/api/blogs', {
      data: {
        excerpt: 'Only excerpt provided',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});

test('unauthenticated user cannot create a blog via API', async ({ request }) => {
  const response = await request.post('/api/blogs', {
    data: {
      title: 'Unauthorized blog',
      content: '<p>Should not be created</p>',
      category: 'Technology',
      status: 'published',
    },
  });

  // ✅ Correct behavior
  expect(response.status()).toBe(401);
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