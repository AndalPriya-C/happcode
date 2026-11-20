/**
 * Live smoke test. Requires the API running (npm run dev) with a reachable Judge0.
 *   API_BASE=http://localhost:4000 npm run test:smoke            -> C++ and Python 3 suites
 *   API_BASE=... npm run test:smoke -- --all                     -> adds hello-world for every language
 * Exits 1 if any case fails. A language whose runtime is missing is reported as SKIP, never PASS.
 */
const BASE = process.env.API_BASE ?? 'http://localhost:4000';
const runAll = process.argv.includes('--all');

interface Expect {
  verdict: 'ok' | 'compile_error' | 'runtime_error' | 'time_limit';
  stdout?: string;
  stderr?: string;
}
interface Case {
  languageId: string;
  name: string;
  sourceCode: string;
  stdin?: string;
  cpuTimeLimitSec?: number;
  expect: Expect;
}

const cpp: Case[] = [
  { languageId: 'cpp', name: 'hello', sourceCode: '#include <iostream>\nint main(){std::cout<<"Hello, World!"<<std::endl;}', expect: { verdict: 'ok', stdout: 'Hello, World!' } },
  { languageId: 'cpp', name: 'stdin sum', sourceCode: '#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}', stdin: '2 40\n', expect: { verdict: 'ok', stdout: '42' } },
  { languageId: 'cpp', name: 'compile error', sourceCode: 'int main(){ return 0 }', expect: { verdict: 'compile_error', stdout: '' } },
  { languageId: 'cpp', name: 'runtime error (null deref)', sourceCode: 'int main(){ int *p = nullptr; return *p; }', expect: { verdict: 'runtime_error' } },
  { languageId: 'cpp', name: 'infinite loop -> time limit', sourceCode: 'int main(){ for(;;){} }', cpuTimeLimitSec: 2, expect: { verdict: 'time_limit' } },
];

const python3: Case[] = [
  { languageId: 'python3', name: 'hello', sourceCode: 'print("Hello, World!")', expect: { verdict: 'ok', stdout: 'Hello, World!' } },
  { languageId: 'python3', name: 'stdin sum', sourceCode: 'a,b=map(int,input().split())\nprint(a+b)', stdin: '2 40\n', expect: { verdict: 'ok', stdout: '42' } },
  { languageId: 'python3', name: 'syntax error (reported at run time in Python)', sourceCode: 'print("x"', expect: { verdict: 'runtime_error', stderr: 'SyntaxError' } },
  { languageId: 'python3', name: 'runtime exception', sourceCode: 'raise ValueError("boom")', expect: { verdict: 'runtime_error', stderr: 'ValueError' } },
  { languageId: 'python3', name: 'infinite loop -> time limit', sourceCode: 'while True:\n    pass', cpuTimeLimitSec: 2, expect: { verdict: 'time_limit' } },
];

const HELLO: Record<string, string> = {
  pypy3: 'print("Hello, World!")',
  c: '#include <stdio.h>\nint main(void){printf("Hello, World!\\n");return 0;}',
  java: 'public class Main { public static void main(String[] a){ System.out.println("Hello, World!"); } }',
  csharp: 'using System; class P { static void Main(){ Console.WriteLine("Hello, World!"); } }',
  javascript: 'console.log("Hello, World!");',
  go: 'package main\nimport "fmt"\nfunc main(){ fmt.Println("Hello, World!") }',
  typescript: 'console.log("Hello, World!");',
  php: '<?php echo "Hello, World!\\n";',
  kotlin: 'fun main() { println("Hello, World!") }',
  rust: 'fn main() { println!("Hello, World!"); }',
  r: 'cat("Hello, World!\\n")',
};
const hello: Case[] = Object.entries(HELLO).map(([languageId, sourceCode]) => ({
  languageId,
  name: 'hello',
  sourceCode,
  expect: { verdict: 'ok' as const, stdout: 'Hello, World!' },
}));

async function poll(id: string): Promise<any> {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${BASE}/api/v1/executions/${id}`);
    const body: any = await res.json();
    if (body.status === 'completed' || body.status === 'failed') return body;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('timed out polling');
}

async function main() {
  const catalogRes = await fetch(`${BASE}/api/v1/languages`);
  const { languages } = (await catalogRes.json()) as { languages: { id: string; available: boolean; reason: string | null }[] };
  const available = new Map(languages.map((l) => [l.id, l]));

  const cases = runAll ? [...cpp, ...python3, ...hello] : [...cpp, ...python3];
  let failed = 0;
  let passed = 0;
  let skipped = 0;

  for (const c of cases) {
    const lang = available.get(c.languageId);
    if (!lang?.available) {
      skipped++;
      console.log(`SKIP  ${c.languageId.padEnd(10)} ${c.name} (${lang?.reason ?? 'not in catalog'})`);
      continue;
    }
    const submit = await fetch(`${BASE}/api/v1/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        languageId: c.languageId,
        sourceCode: c.sourceCode,
        stdin: c.stdin ?? '',
        ...(c.cpuTimeLimitSec ? { config: { cpuTimeLimitSec: c.cpuTimeLimitSec } } : {}),
      }),
    });
    if (submit.status !== 202) {
      failed++;
      console.log(`FAIL  ${c.languageId.padEnd(10)} ${c.name}: submit returned ${submit.status}`);
      continue;
    }
    const exec = await poll((await submit.json() as { id: string }).id);
    const r = exec.result ?? {};
    const problems: string[] = [];
    if (exec.status === 'failed') problems.push(`platform error: ${exec.error?.message}`);
    if (r.verdict !== c.expect.verdict) problems.push(`verdict ${r.verdict} (expected ${c.expect.verdict})`);
    if (c.expect.stdout !== undefined && !String(r.stdout ?? '').includes(c.expect.stdout))
      problems.push(`stdout ${JSON.stringify(r.stdout)}`);
    if (c.expect.stderr !== undefined && !String(r.stderr ?? '').includes(c.expect.stderr))
      problems.push(`stderr ${JSON.stringify(r.stderr)}`);

    if (problems.length) {
      failed++;
      console.log(`FAIL  ${c.languageId.padEnd(10)} ${c.name}: ${problems.join('; ')}`);
    } else {
      passed++;
      console.log(`PASS  ${c.languageId.padEnd(10)} ${c.name} (${r.timeSec ?? '?'}s, ${r.memoryKb ?? '?'} KB)`);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error('Smoke test could not run:', e.message);
  process.exit(1);
});
