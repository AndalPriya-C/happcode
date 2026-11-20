import { config } from '../config.js';

/**
 * Thin client for the Judge0 REST API. Only this file knows Judge0's wire format.
 * Source code and stdin are sent base64-encoded so arbitrary bytes survive transport.
 */

export interface Judge0Language {
  id: number;
  name: string;
}

export interface Judge0Submission {
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
}

export interface CreateSubmissionBody {
  language_id: number;
  source_code: string;
  stdin: string;
  cpu_time_limit: number;
  wall_time_limit: number;
  memory_limit: number; // KB
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(config.JUDGE0_AUTH_TOKEN ? { [config.JUDGE0_AUTH_HEADER]: config.JUDGE0_AUTH_TOKEN } : {}),
    ...config.judge0Headers,
  };
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${config.JUDGE0_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    // Upstream details go to logs only; callers get a generic message.
    const body = await res.text().catch(() => '');
    throw new Error(`Judge0 responded ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

const toB64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
const fromB64 = (s: string | null) => (s ? Buffer.from(s, 'base64').toString('utf8') : '');

export function fetchJudge0Languages(): Promise<Judge0Language[]> {
  return call<Judge0Language[]>('/languages');
}

export async function createSubmission(body: CreateSubmissionBody): Promise<string> {
  const res = await call<{ token: string }>('/submissions?base64_encoded=true&wait=false', {
    method: 'POST',
    body: JSON.stringify({ ...body, source_code: toB64(body.source_code), stdin: toB64(body.stdin) }),
  });
  return res.token;
}

/** Returns the submission with stdout, stderr, compile_output and message decoded from base64. */
export async function getSubmission(token: string): Promise<Judge0Submission> {
  const raw = await call<Judge0Submission>(`/submissions/${encodeURIComponent(token)}?base64_encoded=true`);
  return {
    ...raw,
    stdout: fromB64(raw.stdout),
    stderr: fromB64(raw.stderr),
    compile_output: fromB64(raw.compile_output),
    message: fromB64(raw.message),
  };
}
