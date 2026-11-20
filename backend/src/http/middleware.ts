import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ZodError, type ZodType } from 'zod';
import { config } from '../config.js';
import { ExecutionError } from '../execution/executionService.js';

export const submitLimiter = rateLimit({
  windowMs: 60_000,
  limit: config.RATE_LIMIT_SUBMIT_PER_MIN,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many submissions. Please wait a minute.' } },
});

export const readLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many requests. Please slow down.' } },
});

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'invalid_request',
          message: 'The request is invalid.',
          details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ExecutionError) {
    res.status(err.httpStatus).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'invalid_request', message: 'The request is invalid.' } });
    return;
  }
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { code: 'invalid_json', message: 'Request body must be valid JSON.' } });
    return;
  }
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong on the server.' } });
}
