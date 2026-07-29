import { defineConfig, devices } from '@playwright/test';

/**
 * The suite runs against the *production* bundle, not the dev server: the shipped
 * app is served under a base path (see `base` in `vite.config.ts`, which is what
 * `pages.yml` deploys), and only a real `vite preview` exercises that path.
 */
const PREVIEW_URL = 'http://localhost:4173/istqb-foundation-4-study-lab/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  // Stated rather than inherited: the slowest test measures ~4.5 s (and the few
  // `test.slow()` cases get 3x this), so 30 s is headroom, not a crutch.
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    // The whole suite addresses elements through `data-testid`; pin it explicitly
    // so a Playwright default change cannot silently break every page object.
    testIdAttribute: 'data-testid',
    // Trailing slash is load-bearing: AppPage.goto() navigates to './', which only
    // resolves inside the deployed base path while baseURL ends in a slash.
    baseURL: PREVIEW_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: PREVIEW_URL,
    // One production build up front, not per test — the default 60 s is too tight.
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
