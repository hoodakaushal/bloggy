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
