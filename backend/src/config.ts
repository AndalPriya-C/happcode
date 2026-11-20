import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  JUDGE0_URL: z.string().url(),
  JUDGE0_AUTH_HEADER: z.string().default('X-Auth-Token'),
  JUDGE0_AUTH_TOKEN: z.string().optional(),
  JUDGE0_EXTRA_HEADERS: z.string().default('{}'),
  PYPY3_JUDGE0_LANGUAGE_ID: z.coerce.number().int().positive().optional(),

  MAX_CPU_TIME_SEC: z.coerce.number().positive().max(15).default(5),
  MAX_WALL_TIME_SEC: z.coerce.number().positive().max(30).default(10),
  MAX_MEMORY_MB: z.coerce.number().positive().max(512).default(256),
  MAX_SOURCE_BYTES: z.coerce.number().int().positive().default(65536),
  MAX_STDIN_BYTES: z.coerce.number().int().positive().default(65536),
  MAX_CONCURRENT_EXECUTIONS: z.coerce.number().int().positive().default(20),

  RATE_LIMIT_SUBMIT_PER_MIN: z.coerce.number().int().positive().default(20),
  RESULT_TTL_MINUTES: z.coerce.number().int().positive().default(30),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
const env = parsed.data;

let judge0Headers: Record<string, string> = {};
try {
  judge0Headers = JSON.parse(env.JUDGE0_EXTRA_HEADERS) as Record<string, string>;
} catch {
  console.error('JUDGE0_EXTRA_HEADERS must be a JSON object of header names to values');
  process.exit(1);
}

export const config = {
  ...env,
  corsOrigins: env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  judge0Headers,
};
