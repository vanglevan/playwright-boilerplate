import { test as base } from '@playwright/test';
import { ApiClient } from '@api/api-client';
import { UsersApi } from '@api/endpoints/users.api';

export interface ApiFixtures {
  api: ApiClient;
  usersApi: UsersApi;
}

/**
 * API-client fixture — one ApiClient per test (auto-disposed).
 * Endpoint modules wrap the client for resource-style usage.
 */
export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const client = await ApiClient.create();
    await use(client);
    await client.dispose();
  },
  usersApi: async ({ api }, use) => {
    await use(new UsersApi(api));
  },
});
