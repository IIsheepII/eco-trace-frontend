import { defineConfig, devices } from '@playwright/test';

const useExistingServer = process.env.PLAYWRIGHT_USE_EXISTING_SERVER === 'true';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  globalTimeout: 90_000,
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  webServer: useExistingServer
    ? undefined
    : {
        command: 'node ./node_modules/vite/bin/vite.js --host 0.0.0.0',
        url: 'http://localhost:5174',
        reuseExistingServer: true,
      },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
