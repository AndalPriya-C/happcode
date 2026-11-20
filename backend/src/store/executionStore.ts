import { config } from '../config.js';
import type { LanguageId } from '../languages/registry.js';
import type { Outcome } from '../execution/normalize.js';

export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ExecutionRecord {
  id: string;
  status: ExecutionStatus;
  languageId: LanguageId;
  createdAt: number;
  updatedAt: number;
  limits: { cpuTimeSec: number; wallTimeSec: number; memoryMb: number };
  outcome: Outcome | null;
  /** Set when status is 'failed' because of a platform problem, never user code. */
  errorMessage: string | null;
}

/**
 * Storage boundary. Results are short-lived, so this in-memory implementation is enough for now.
 * When results must persist (history, accounts), add a PostgresExecutionStore with the same methods
 * and switch the export below. No other file needs to change.
 */
export interface ExecutionStore {
  put(record: ExecutionRecord): void;
  get(id: string): ExecutionRecord | undefined;
  sweep(maxAgeMs: number): void;
}

class MemoryExecutionStore implements ExecutionStore {
  private records = new Map<string, ExecutionRecord>();
  put(record: ExecutionRecord) {
    this.records.set(record.id, record);
  }
  get(id: string) {
    return this.records.get(id);
  }
  sweep(maxAgeMs: number) {
    const cutoff = Date.now() - maxAgeMs;
    for (const [id, r] of this.records) if (r.updatedAt < cutoff) this.records.delete(id);
  }
}

export const executionStore: ExecutionStore = new MemoryExecutionStore();

setInterval(() => executionStore.sweep(config.RESULT_TTL_MINUTES * 60_000), 60_000).unref();
