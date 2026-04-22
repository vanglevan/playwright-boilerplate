import type { Page } from '@playwright/test';

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  message?: string;
}

export const poll = async <T>(
  fn: () => Promise<T | undefined | null | false>,
  { intervalMs = 250, timeoutMs = 10_000, message = 'Polling condition not met' }: PollOptions = {}
): Promise<T> => {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const result = await fn();
      if (result) {
        return result;
      }
    } catch (err) {
      lastError = err;
    }
    await sleep(intervalMs);
  }
  const cause = lastError instanceof Error ? `: ${lastError.message}` : '';
  throw new Error(`${message} (timeout ${timeoutMs}ms)${cause}`);
};

export const waitForNetworkIdle = async (page: Page, timeoutMs = 10_000): Promise<void> => {
  await page.waitForLoadState('networkidle', { timeout: timeoutMs });
};
