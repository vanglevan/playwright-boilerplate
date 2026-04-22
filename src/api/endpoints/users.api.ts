import type { ApiClient } from '@api/api-client';
import type { ApiResult } from '@app-types/api';

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  email?: string;
}

/**
 * Resource-style endpoint module — keeps URLs and shapes encapsulated.
 * Reuse from API tests AND from fixtures that seed data for UI tests.
 *
 * Wired to https://jsonplaceholder.typicode.com (no-auth public sandbox)
 * for out-of-the-box demo runs. Replace with your real API in production.
 */
export class UsersApi {
  constructor(private readonly client: ApiClient) {}

  list(): Promise<ApiResult<ApiUser[]>> {
    return this.client.get<ApiUser[]>('/users');
  }

  get(id: number): Promise<ApiResult<ApiUser>> {
    return this.client.get<ApiUser>(`/users/${id}`);
  }

  create(payload: CreateUserPayload): Promise<ApiResult<ApiUser>> {
    return this.client.post<ApiUser>('/users', { body: payload });
  }

  update(id: number, payload: UpdateUserPayload): Promise<ApiResult<ApiUser>> {
    return this.client.put<ApiUser>(`/users/${id}`, { body: payload });
  }

  delete(id: number): Promise<ApiResult<unknown>> {
    return this.client.delete(`/users/${id}`);
  }
}
