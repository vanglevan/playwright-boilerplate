import { test as base } from '@playwright/test';
import { env } from '@config/env';
import type { TestUser } from '@app-types/user';

export interface AuthFixtures {
  testUser: TestUser;
  adminUser: TestUser;
}

/**
 * Provides typed user records derived from env.
 * Storage-state-based session reuse is wired in playwright.config.ts via
 * the `setup` project + `tests/auth.setup.ts`.
 */
export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    await use({
      firstName: 'Test',
      lastName: 'User',
      email: env.TEST_USER_EMAIL,
      password: env.TEST_USER_PASSWORD,
    });
  },
  adminUser: async ({}, use) => {
    if (!env.ADMIN_USER_EMAIL || !env.ADMIN_USER_PASSWORD) {
      throw new Error(
        'ADMIN_USER_EMAIL / ADMIN_USER_PASSWORD must be set to use the adminUser fixture.'
      );
    }
    await use({
      firstName: 'Admin',
      lastName: 'User',
      email: env.ADMIN_USER_EMAIL,
      password: env.ADMIN_USER_PASSWORD,
    });
  },
});
