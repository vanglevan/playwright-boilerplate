import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { z } from 'zod';

const ROOT = path.resolve(__dirname, '..', '..');

const requestedEnv = (process.env.TEST_ENV ?? 'dev').toLowerCase();
const envFile = path.join(ROOT, `.env.${requestedEnv}`);
const fallbackFile = path.join(ROOT, '.env');

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
} else if (fs.existsSync(fallbackFile)) {
  dotenv.config({ path: fallbackFile, override: false });
}
dotenv.config({ path: path.join(ROOT, '.env'), override: false });

const booleanString = z
  .union([z.string(), z.boolean()])
  .transform((v) =>
    typeof v === 'boolean' ? v : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
  );

const numberString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? v : Number(v)))
  .pipe(z.number().int().nonnegative());

const EnvSchema = z.object({
  TEST_ENV: z.enum(['dev', 'staging', 'prod', 'local']).default('dev'),
  BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),

  TEST_USER_EMAIL: z.string().email(),
  TEST_USER_PASSWORD: z.string().min(1),
  ADMIN_USER_EMAIL: z.string().email().optional(),
  ADMIN_USER_PASSWORD: z.string().min(1).optional(),
  API_TOKEN: z.string().optional().default(''),

  HEADLESS: booleanString.default('true'),
  SLOW_MO: numberString.default('0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DEFAULT_TIMEOUT_MS: numberString.default('30000'),
  ACTION_TIMEOUT_MS: numberString.default('15000'),
  NAVIGATION_TIMEOUT_MS: numberString.default('30000'),
  EXPECT_TIMEOUT_MS: numberString.default('10000'),

  CI: booleanString.default('false'),
  WORKERS: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : Number(v))),
  RETRIES: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : Number(v))),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Invalid environment variables for TEST_ENV="${requestedEnv}":\n${formatted}\n` +
      `Check your .env / .env.${requestedEnv} file (see .env.example).`
  );
}

export const env: Env = parsed.data;

export const isCI = env.CI;
export const isProd = env.TEST_ENV === 'prod';
