import type { ExecutionService, OutputLine, RunMetrics, RunRequest, RunResult } from './execution';

/**
 * REAL execution: submits to the HappCode API, then polls until Judge0 finishes.
 * Nothing here fabricates output: every line comes from the API's response.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const POLL_MS = 400;

type Verdict = 'ok' | 'compile_error' | 'runtime_error' | 'time_limit' | 'internal_error';

interface ApiExecution {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  error: { code: string; message: string } | null;
  result: {
    verdict: Verdict;
    stdout: string;
    stderr: string;
    compileOutput: string;
    message: string;
    timeSec: number | null;
    memoryKb: number | null;
  } | null;
}

const VERDICT_TITLE: Record<Exclude<Verdict, 'ok' | 'compile_error'>, string> = {
  runtime_error: 'Runtime error',
  time_limit: 'Time limit exceeded',
  internal_error: 'Execution service error',
};

function abortError() {
  return new DOMException('Aborted', 'AbortError');
}

function sleep(ms: number, signal: AbortSignal) {
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

async function api<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | ApiExecution | null;
  if (!res.ok) {
    const message = (body as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(message ?? `Request failed (${res.status})`);
  }
  return body as T;
}

function toRunResult(exec: ApiExecution): RunResult {
  const lines: Omit<OutputLine, 'id'>[] = [];
  const r = exec.result;

  if (exec.status === 'failed' || !r) {
    lines.push({ kind: 'error', text: `[${exec.error?.message ?? 'Execution failed'}]` });
    return { lines, metrics: null };
  }

  if (r.verdict === 'compile_error') {
    lines.push({ kind: 'error', text: r.compileOutput || r.message || 'Compilation failed' });
    lines.push({ kind: 'exit', text: '[Compilation failed]' });
  } else {
    if (r.stdout) lines.push({ kind: 'result', text: r.stdout.replace(/\n$/, '') });
    if (r.stderr) lines.push({ kind: 'error', text: r.stderr.replace(/\n$/, '') });
    if (r.verdict !== 'ok') {
      const title = VERDICT_TITLE[r.verdict as Exclude<Verdict, 'ok' | 'compile_error'>];
      lines.push({ kind: 'error', text: `[${title}${r.message ? `: ${r.message}` : ''}]` });
    }
    if (!r.stdout && !r.stderr && r.verdict === 'ok') lines.push({ kind: 'result', text: '(no output)' });
    const time = r.timeSec != null ? ` in ${r.timeSec.toFixed(3)}s` : '';
    lines.push({ kind: 'exit', text: r.verdict === 'ok' ? `[Process finished${time}]` : `[Process ended with errors${time}]` });
  }

  const metrics: RunMetrics = {
    exitCode: r.verdict === 'ok' ? 0 : null,
    durationMs: r.timeSec != null ? Math.round(r.timeSec * 1000) : 0,
    memoryMb: r.memoryKb != null ? Math.round((r.memoryKb / 1024) * 10) / 10 : null,
    cpuPercent: null,
    peakRamMb: null,
    threadId: null,
  };
  return { lines, metrics };
}

export const httpExecutionService: ExecutionService = {
  isMock: false,

  async run({ languageId, code, stdin }: RunRequest, signal: AbortSignal): Promise<RunResult> {
    try {
      const created = await api<ApiExecution>('/api/v1/executions', {
        method: 'POST',
        body: JSON.stringify({ languageId, sourceCode: code, stdin }),
        signal,
      });

      let exec = created;
      while (exec.status === 'queued' || exec.status === 'running') {
        await sleep(POLL_MS, signal);
        exec = await api<ApiExecution>(`/api/v1/executions/${created.id}`, { method: 'GET', signal });
      }
      return toRunResult(exec);
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') throw err;
      const message = err instanceof Error ? err.message : 'Unexpected error';
      return { lines: [{ kind: 'error', text: `[${message}]` }], metrics: null };
    }
  },
};
