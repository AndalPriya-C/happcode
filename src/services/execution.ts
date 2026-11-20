import type { LanguageId } from '../config/languages';

/**
 * The ONLY contract between the UI and code execution.
 * Phase 1 ships a mock implementation (src/mock/mockExecutionService.ts).
 * Phase 2 replaces it with a real backend by changing src/services/index.ts.
 */
export interface RunRequest {
  languageId: LanguageId;
  code: string;
  stdin: string;
}

export type OutputKind = 'mock' | 'env' | 'step' | 'result' | 'error' | 'exit';

export interface OutputLine {
  id: number;
  kind: OutputKind;
  text: string;
}

/** null = not provided by the execution service (shown as "—" in the UI). */
export interface RunMetrics {
  exitCode: number | null;
  durationMs: number;
  memoryMb: number | null;
  cpuPercent: number | null;
  peakRamMb: number | null;
  threadId: string | null;
}

export interface RunResult {
  lines: Omit<OutputLine, 'id'>[];
  metrics: RunMetrics | null;
}

export interface ExecutionService {
  /** true while results are fabricated; the UI labels the output accordingly. */
  readonly isMock: boolean;
  /** Must reject with a DOMException named "AbortError" when aborted. */
  run(request: RunRequest, signal: AbortSignal): Promise<RunResult>;
}
