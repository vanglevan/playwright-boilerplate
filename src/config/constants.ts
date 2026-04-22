export const STORAGE_STATE_DIR = 'playwright/.auth';

export const STORAGE_STATE = {
  user: `${STORAGE_STATE_DIR}/user.json`,
  admin: `${STORAGE_STATE_DIR}/admin.json`,
} as const;

export const REPORT_DIRS = {
  html: 'reports/html-report',
  allure: 'reports/allure-results',
  monocart: 'reports/monocart-report/index.html',
  blob: 'reports/blob-report',
  junit: 'reports/junit/results.xml',
  testResults: 'test-results',
} as const;

export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  critical: '@critical',
  visual: '@visual',
  a11y: '@a11y',
  perf: '@perf',
  api: '@api',
  mobile: '@mobile',
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];
