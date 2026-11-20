import { Router } from 'express';
import { getCatalog } from '../execution/catalog.js';
import { getExecution, submitExecution } from '../execution/executionService.js';
import type { Outcome } from '../execution/normalize.js';
import type { ExecutionRecord } from '../store/executionStore.js';
import { executionIdSchema, submitSchema } from './schemas.js';
import { readLimiter, submitLimiter, validateBody } from './middleware.js';

const MAX_RETURNED_BYTES = 64 * 1024;

function clip(s: string) {
  return Buffer.byteLength(s, 'utf8') <= MAX_RETURNED_BYTES ? s : Buffer.from(s).subarray(0, MAX_RETURNED_BYTES).toString('utf8') + '\n[output truncated]';
}

function present(rec: ExecutionRecord) {
  const o: Outcome | null = rec.outcome;
  return {
    id: rec.id,
    status: rec.status,
    languageId: rec.languageId,
    createdAt: new Date(rec.createdAt).toISOString(),
    updatedAt: new Date(rec.updatedAt).toISOString(),
    limits: rec.limits,
    error: rec.errorMessage ? { code: 'platform_error', message: rec.errorMessage } : null,
    result: o
      ? {
          verdict: o.verdict,
          statusDescription: o.statusDescription,
          stdout: clip(o.stdout),
          stderr: clip(o.stderr),
          compileOutput: clip(o.compileOutput),
          message: o.message,
          timeSec: o.timeSec,
          memoryKb: o.memoryKb,
        }
      : null,
  };
}

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ ok: true }));

apiRouter.get('/languages', readLimiter, (_req, res) => {
  res.json({ languages: getCatalog() });
});

// Submit: validates, queues the run on Judge0, returns an id immediately (202).
apiRouter.post('/executions', submitLimiter, validateBody(submitSchema), (req, res) => {
  const rec = submitExecution(req.body);
  res.status(202).json(present(rec));
});

// Status + result: poll this until status is 'completed' or 'failed'.
apiRouter.get('/executions/:id', readLimiter, (req, res) => {
  const parsed = executionIdSchema.safeParse(req.params.id);
  const rec = parsed.success ? getExecution(parsed.data) : undefined;
  if (!rec) {
    res.status(404).json({ error: { code: 'not_found', message: 'Execution not found or expired.' } });
    return;
  }
  res.json(present(rec));
});

