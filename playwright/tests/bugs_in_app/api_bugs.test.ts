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
    baseURL: 'http://localhost:3001',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
});


// Genuine issue invalid file returning 500 instead of a 400
test.describe('POST /api/upload – invalid file upload', () => {
  test('should reject non-image file upload @bugs', async () => {
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