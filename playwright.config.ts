import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import { env, isCI } from './src/config/env';
import { REPORT_DIRS, STORAGE_STATE } from './src/config/constants';

/**
 * Reporter matrix
 * --------------------------------------------------------------------------
 * - list           : compact stdout (always)
 * - html           : interactive HTML report
 * - junit          : for Jenkins / CI dashboards
 * - blob           : merge-able shards on CI (run `npx playwright merge-reports`)
 * - allure         : rich history, trends, suites — opened via `npm run report:allure:*`
 * - monocart       : single-file HTML w/ coverage, network, screenshots
 *
 * On CI we also emit `blob` so sharded jobs can be merged downstream.
 */
const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { outputFolder: REPORT_DIRS.html, open: 'never' }],
  ['junit', { outputFile: REPORT_DIRS.junit }],
  ['allure-playwright', { outputFolder: REPORT_DIRS.allure, detail: true, suiteTitle: false }],
  [
    'monocart-reporter',
    {
      name: 'Playwright Boilerplate Report',
      outputFile: REPORT_DIRS.monocart,
      coverage: { entryFilter: () => true, sourceFilter: (s: string) => s.includes('src/') },
    },
  ],
];

if (isCI) {
  reporters.push(['blob', { outputDir: REPORT_DIRS.blob }]);
  reporters.push(['github']);
}

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: env.RETRIES ?? (isCI ? 2 : 0),
  workers: env.WORKERS ?? (isCI ? '50%' : undefined),
  timeout: env.DEFAULT_TIMEOUT_MS,
  expect: { timeout: env.EXPECT_TIMEOUT_MS },
  reporter: reporters,
  reportSlowTests: { max: 5, threshold: 60_000 },
  metadata: {
    environment: env.TEST_ENV,
    baseURL: env.BASE_URL,
    apiBaseURL: env.API_BASE_URL,
  },
  globalSetup: undefined,
  globalTeardown: undefined,

  /* Default options applied to every project unless overridden. */
  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    launchOptions: { slowMo: env.SLOW_MO },
    actionTimeout: env.ACTION_TIMEOUT_MS,
    navigationTimeout: env.NAVIGATION_TIMEOUT_MS,
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    testIdAttribute: 'data-testid',
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    extraHTTPHeaders: {
      'x-test-source': 'playwright-boilerplate',
    },
  },

  projects: [
    /* ---------------------------------------------------------------------
     * Auth setup — runs first, persists logged-in state to STORAGE_STATE.user
     * UI projects depend on it via `dependencies: ['setup']`.
     * ------------------------------------------------------------------- */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },

    /* ----------------------------- Desktop E2E -------------------------- */
    {
      name: 'chromium-e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE.user },
    },
    {
      name: 'firefox-e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE.user },
    },
    {
      name: 'webkit-e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE.user },
    },

    /* ----------------------------- Mobile ------------------------------- */
    {
      name: 'mobile-chrome',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE.user },
    },
    {
      name: 'mobile-safari',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['iPhone 14'], storageState: STORAGE_STATE.user },
    },

    /* ------------------------------ API --------------------------------- */
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.API_BASE_URL },
    },

    /* -------------------------- Visual Regression ----------------------- */
    {
      name: 'visual',
      testDir: './tests/visual',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.user,
      },
      snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
      expect: {
        toHaveScreenshot: {
          maxDiffPixelRatio: 0.01,
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
        },
      },
    },

    /* ------------------------- Accessibility (a11y) --------------------- */
    {
      name: 'accessibility',
      testDir: './tests/a11y',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE.user },
    },

    /* ------------------------------ Performance ------------------------- */
    {
      name: 'performance',
      testDir: './tests/performance',
      use: {
        ...devices['Desktop Chrome'],
        // Perf runs deserve fresh, un-throttled context — no storageState.
      },
    },
  ],

  /* Optional: spin up local app server before tests. Uncomment & adjust.
  webServer: {
    command: 'npm run start',
    url: env.BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  */
});
