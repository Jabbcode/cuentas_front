import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const BACKEND_DIR = path.resolve(process.cwd(), '..', 'cuentas-backend');

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev:test',
      cwd: BACKEND_DIR,
      url: 'http://localhost:3001/api/health',
      timeout: 30_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      timeout: 30_000,
      reuseExistingServer: false,
      env: { VITE_API_URL: 'http://localhost:3001/api' },
    },
  ],
});
