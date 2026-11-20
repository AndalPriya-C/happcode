import { LANGUAGES } from '../config/languages';
import type { ExecutionService, RunRequest, RunResult } from '../services/execution';

/* ------------------------------------------------------------------
 * MOCK ONLY (Phase 1). Nothing here runs the user's code.
 * The sample values below are the ones shown in the Figma mobile frame.
 * ------------------------------------------------------------------ */

const MOCK_DELAY_MS = 1400;

function abortError() {
  return new DOMException('Aborted', 'AbortError');
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export const mockExecutionService: ExecutionService = {
  isMock: true,

  async run({ languageId, stdin }: RunRequest, signal: AbortSignal): Promise<RunResult> {
    await wait(MOCK_DELAY_MS, signal);

    const lang = LANGUAGES[languageId];
    const firstInput = stdin.split('\n')[0]?.trim().slice(0, 40);

    const lines: RunResult['lines'] = [
      { kind: 'mock', text: 'Mock output · Phase 1 UI demo · your code was not executed' },
      { kind: 'env', text: `=== Environment initialized: ${lang.envVersion} Linux x86_64 ===` },
      { kind: 'step', text: `Compiling & Executing in ${lang.runtime}...` },
      { kind: 'step', text: 'Allocating isolated runtime container sandbox...' },
    ];
    if (firstInput) lines.push({ kind: 'step', text: `Streaming stdin '${firstInput}' to process descriptors...` });
    lines.push(
      { kind: 'result', text: '>>> Harmonic sum(42) = 4.32828' },
      { kind: 'exit', text: '[Process finished with exit code 0 in 0.421s]' },
    );

    return {
      lines,
      metrics: { exitCode: 0, durationMs: 421, memoryMb: 14.8, cpuPercent: 2.4, peakRamMb: 18.2, threadId: '#0481' },
    };
  },
};
