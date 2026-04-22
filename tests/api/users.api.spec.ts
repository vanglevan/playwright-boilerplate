import { test, expect } from '@fixtures/index';
import { unwrap } from '@api/api-client';
import { TAGS } from '@config/constants';

test.describe(`Users API ${TAGS.api}`, () => {
  test('list users returns an array', async ({ usersApi }) => {
    const data = unwrap(await usersApi.list());
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const first = data[0];
    expect(first).toBeDefined();
    expect(first?.id).toBeGreaterThan(0);
    expect(first?.email).toContain('@');
  });

  test('get user by id returns the right user', async ({ usersApi }) => {
    const data = unwrap(await usersApi.get(1));
    expect(data.id).toBe(1);
    expect(data.email).toBeTruthy();
  });

  test('create user echoes payload + assigns id', async ({ usersApi }) => {
    const payload = { name: 'Boilerplate Bot', username: 'bot', email: 'bot@example.com' };
    const data = unwrap(await usersApi.create(payload));
    expect(data.name).toBe(payload.name);
    expect(data.id).toBeGreaterThan(0);
  });

  test('get non-existing user returns 404', async ({ usersApi }) => {
    const result = await usersApi.get(999_999);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });
});
