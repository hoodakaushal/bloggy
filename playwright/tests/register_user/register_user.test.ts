import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { registerAdmin,validateErrorMessageLoginRegisterPage } from '../../pages/loginPage';

const rootDir = path.resolve(__dirname, '../../..');

test.describe('User must be able to ', () => {

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
  test('Register a new user', async ({ page }) => {
   await registerAdmin(page, 'ojas', 'password')
  });

   test('See Error on password length', async ({ page }) => {
   await registerAdmin(page, 'notojas', 'passw', false)
   await validateErrorMessageLoginRegisterPage(page,'Password must be at least 6 characters');
  });

  test('See Error on existing user register', async ({ page }) => {
   await registerAdmin(page, 'ojas', 'passwor', false)
   await validateErrorMessageLoginRegisterPage(page,'Username already exists');
  });

});
