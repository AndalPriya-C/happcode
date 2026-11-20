import type { Judge0Submission } from './judge0.js';

export type Verdict = 'ok' | 'compile_error' | 'runtime_error' | 'time_limit' | 'internal_error';

export interface Outcome {
  verdict: Verdict;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  statusDescription: string;
  timeSec: number | null;
  memoryKb: number | null;
}

export interface Progress {
  finished: boolean;
  running: boolean;
  outcome: Outcome | null;
}

/**
 * Judge0 status ids: 1 In Queue, 2 Processing, 3 Accepted, 4 Wrong Answer (no expected output
 * is sent, so treated as finished), 5 Time Limit Exceeded, 6 Compilation Error,
 * 7-12 Runtime Error variants, 13 Internal Error, 14 Exec Format Error.
 */
export function normalize(raw: Judge0Submission): Progress {
  const id = raw.status.id;
  if (id === 1) return { finished: false, running: false, outcome: null };
  if (id === 2) return { finished: false, running: true, outcome: null };

  let verdict: Verdict;
  if (id === 3 || id === 4) verdict = 'ok';
  else if (id === 5) verdict = 'time_limit';
  else if (id === 6) verdict = 'compile_error';
  else if (id >= 7 && id <= 12) verdict = 'runtime_error';
  else verdict = 'internal_error';

  return {
    finished: true,
    running: false,
    outcome: {
      verdict,
      stdout: raw.stdout ?? '',
      stderr: raw.stderr ?? '',
      compileOutput: raw.compile_output ?? '',
      message: raw.message ?? '',
      statusDescription: raw.status.description,
      timeSec: raw.time ? Number.parseFloat(raw.time) : null,
      memoryKb: raw.memory ?? null,
    },
  };
}
