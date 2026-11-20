import { z } from 'zod';
import { config } from '../config.js';
import { LANGUAGE_IDS } from '../languages/registry.js';

const withinBytes = (max: number) => (s: string) => Buffer.byteLength(s, 'utf8') <= max;

export const submitSchema = z
  .object({
    languageId: z.enum(LANGUAGE_IDS),
    sourceCode: z
      .string()
      .min(1, 'Source code is empty')
      .refine(withinBytes(config.MAX_SOURCE_BYTES), `Source code must be at most ${config.MAX_SOURCE_BYTES} bytes`),
    stdin: z
      .string()
      .default('')
      .refine(withinBytes(config.MAX_STDIN_BYTES), `Input must be at most ${config.MAX_STDIN_BYTES} bytes`),
    config: z
      .object({
        cpuTimeLimitSec: z.number().positive().max(config.MAX_CPU_TIME_SEC).optional(),
        memoryLimitMb: z.number().positive().max(config.MAX_MEMORY_MB).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const executionIdSchema = z.string().uuid();
