import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { loginAdmin,validateErrorMessageLoginRegisterPage } from '../../pages/loginPage';

const rootDir = path.resolve(__dirname, '../../..');

test.describe('Login Page: Negatice cases', () => {

  // 🔹 Reset + seed ONCE
  test.beforeAll(() => {
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
  });
  test('Wrong credentials', async ({ page }) => {
   await loginAdmin(page, 'ojas', 'password', false)
   await validateErrorMessageLoginRegisterPage(page,'Invalid credentials');
  });

   test('URL remain /login on empty, username only, password only submission', async ({ page }) => {

   // Empty Validation
   await loginAdmin(page, '', '', false)
   await expect(page).toHaveURL(/^https?:\/\/.*\/login$/);

   // Password missing
   await loginAdmin(page, 'admin', '', false)
   await expect(page).toHaveURL(/^https?:\/\/.*\/login$/);

   // Username missing
   await loginAdmin(page, '', 'password', false)
   await expect(page).toHaveURL(/^https?:\/\/.*\/login$/);
  });



});
