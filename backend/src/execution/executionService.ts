import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import type { LanguageId } from '../languages/registry.js';
import { executionStore, type ExecutionRecord } from '../store/executionStore.js';
import { getEntry } from './catalog.js';
import { createSubmission, getSubmission } from './judge0.js';
import { normalize } from './normalize.js';

export class ExecutionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(message);
  }
}

export interface SubmitInput {
  languageId: LanguageId;
  sourceCode: string;
  stdin: string;
  config?: { cpuTimeLimitSec?: number; memoryLimitMb?: number };
}

let active = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Clamps client limits to server caps. A client can request less, never more. */
function resolveLimits(input: SubmitInput) {
  const cpu = Math.min(input.config?.cpuTimeLimitSec ?? config.MAX_CPU_TIME_SEC, config.MAX_CPU_TIME_SEC);
  const memoryMb = Math.min(input.config?.memoryLimitMb ?? config.MAX_MEMORY_MB, config.MAX_MEMORY_MB);
  return { cpuTimeSec: cpu, wallTimeSec: config.MAX_WALL_TIME_SEC, memoryMb };
}

export function submitExecution(input: SubmitInput): ExecutionRecord {
  const entry = getEntry(input.languageId);
  if (!entry.available || entry.judge0LanguageId === null) {
    throw new ExecutionError('language_unavailable', `${entry.label} is not available: ${entry.reason ?? 'unknown'}`, 503);
  }
  if (active >= config.MAX_CONCURRENT_EXECUTIONS) {
    throw new ExecutionError('busy', 'The execution service is busy. Please try again shortly.', 429);
  }

  const now = Date.now();
  const record: ExecutionRecord = {
    id: randomUUID(),
    status: 'queued',
    languageId: input.languageId,
    createdAt: now,
    updatedAt: now,
    limits: resolveLimits(input),
    outcome: null,
    errorMessage: null,
  };
  executionStore.put(record);

  active++;
  void runExecution(record, entry.judge0LanguageId, input).finally(() => active--);
  return record;
}

export function getExecution(id: string): ExecutionRecord | undefined {
  return executionStore.get(id);
}

function update(record: ExecutionRecord, patch: Partial<ExecutionRecord>) {
  Object.assign(record, patch, { updatedAt: Date.now() });
  executionStore.put(record);
}

async function runExecution(record: ExecutionRecord, judge0LanguageId: number, input: SubmitInput) {
  const { limits } = record;
  // Give Judge0 its own queueing time on top of the wall-clock limit before we give up.
  const deadline = Date.now() + (limits.wallTimeSec + 20) * 1000;

  try {
    const token = await createSubmission({
      language_id: judge0LanguageId,
      source_code: input.sourceCode,
      stdin: input.stdin,
      cpu_time_limit: limits.cpuTimeSec,
      wall_time_limit: limits.wallTimeSec,
      memory_limit: limits.memoryMb * 1024,
    });
    update(record, { status: 'running' });

    while (Date.now() < deadline) {
      const progress = normalize(await getSubmission(token));
      if (progress.finished && progress.outcome) {
        update(record, { status: 'completed', outcome: progress.outcome });
        return;
      }
      await sleep(400);
    }
    update(record, { status: 'failed', errorMessage: 'The execution service did not respond in time.' });
  } catch (err) {
    console.error(`[execution ${record.id}] platform error:`, (err as Error).message);
    update(record, { status: 'failed', errorMessage: 'The execution service encountered an error. Please try again.' });
  }
}
