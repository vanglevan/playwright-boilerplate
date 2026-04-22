import { mergeTests, expect } from '@playwright/test';
import { test as pages } from './pages.fixture';
import { test as api } from './api.fixture';
import { test as auth } from './auth.fixture';

/**
 * The single `test` import every spec should use.
 *
 * Combines:
 *   - Page-object fixtures   (pages.fixture)
 *   - API client fixtures    (api.fixture)
 *   - Auth/user fixtures     (auth.fixture)
 *
 * Storage-state authentication is configured per-project in playwright.config.ts;
 * tests don't need to log in manually unless they're explicitly testing the login UX.
 */
export const test = mergeTests(pages, api, auth);
export { expect };
