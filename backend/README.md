# HappCode API (Phase 2)

Express + TypeScript service that validates requests and forwards code to **Judge0** (a sandboxed
execution service). User code never runs inside this process.

## Run locally
```bash
cd backend
cp .env.example .env          # then fill in JUDGE0_URL and credentials
npm install
npm run dev                   # http://localhost:4000
npm run test:smoke            # C++ and Python 3 live tests (needs a reachable Judge0)
npm run test:smoke -- --all   # plus hello-world for every other language
```
Node 18.17+ is required (uses global `fetch`).

## Execution service setup (Judge0)
Option A, hosted: create an account on Judge0 CE via RapidAPI, then set
`JUDGE0_AUTH_HEADER=X-RapidAPI-Key`, `JUDGE0_AUTH_TOKEN=<key>`,
`JUDGE0_EXTRA_HEADERS={"X-RapidAPI-Host":"judge0-ce.p.rapidapi.com"}`.

Option B, self-hosted: run Judge0 CE with Docker on a separate machine (its sandbox uses `isolate`
and needs privileged containers, so it must not share a host with this API). Set
`JUDGE0_AUTH_HEADER=X-Auth-Token` and `JUDGE0_AUTH_TOKEN=<AUTHN_TOKEN from Judge0's config>`.

Then check `GET /api/v1/languages`. Only languages reported `available: true` can run. The server
verifies every runtime against Judge0's own list at startup and every 5 minutes.

## Endpoints

Base path `/api/v1`. All responses are JSON.

### `GET /languages`
Lists supported languages and whether each runtime is verified on the execution service.
```json
{ "languages": [
  { "id": "cpp", "label": "C++", "available": true, "judge0LanguageId": 54, "judge0Name": "C++ (GCC 9.2.0)", "reason": null },
  { "id": "pypy3", "label": "PyPy 3", "available": false, "judge0LanguageId": null, "judge0Name": null,
    "reason": "Set PYPY3_JUDGE0_LANGUAGE_ID to a PyPy runtime on Judge0" }
] }
```

### `POST /executions`  (submit, 202 Accepted)
Rate limited (`RATE_LIMIT_SUBMIT_PER_MIN` per IP per minute).
```json
{
  "languageId": "python3",
  "sourceCode": "print(input())",
  "stdin": "hello\n",
  "config": { "cpuTimeLimitSec": 2, "memoryLimitMb": 128 }
}
```
`config` is optional. Values above the server caps are rejected with 400, so clients can ask for less,
never more. Unknown fields are rejected.

Response (202):
```json
{ "id": "5b2f…", "status": "queued", "languageId": "python3", "createdAt": "…", "updatedAt": "…",
  "limits": { "cpuTimeSec": 5, "wallTimeSec": 10, "memoryMb": 256 }, "error": null, "result": null }
```

### `GET /executions/:id`  (status and result)
Poll until `status` is `completed` or `failed`.
```json
{
  "id": "5b2f…",
  "status": "completed",
  "error": null,
  "result": {
    "verdict": "ok",
    "statusDescription": "Accepted",
    "stdout": "hello\n",
    "stderr": "",
    "compileOutput": "",
    "message": "",
    "timeSec": 0.021,
    "memoryKb": 9216
  }
}
```

`verdict` values:
| verdict | meaning |
|---|---|
| `ok` | ran to completion (exit code 0 for compiled languages). Check `stderr` too. |
| `compile_error` | did not compile. Details in `compileOutput`. |
| `runtime_error` | crashed or exited non-zero. Details in `stderr` / `message`. |
| `time_limit` | exceeded the CPU or wall-clock limit. |
| `internal_error` | the execution service itself failed. |

`status: "failed"` with `error` set means a platform problem (e.g. Judge0 unreachable). It is never
caused by user code. Results expire after `RESULT_TTL_MINUTES` (default 30) and then return 404.

### Other responses
| HTTP | code | when |
|---|---|---|
| 400 | `invalid_request` | validation failed. `error.details` lists the fields. |
| 400 | `invalid_json` | body is not valid JSON. |
| 404 | `not_found` | unknown or expired execution id. |
| 404 | `not_found` | unknown route. |
| 429 | `rate_limited` | too many requests from this IP. |
| 429 | `busy` | `MAX_CONCURRENT_EXECUTIONS` reached. Retry shortly. |
| 503 | `language_unavailable` | the runtime is not verified on the execution service. |
| 500 | `internal_error` | unexpected server error (details only in server logs). |

## Security
- **Isolation:** code is compiled and run by Judge0 in its own sandbox on a separate host. This process
  only sends and receives JSON.
- **Limits:** CPU time, wall-clock time, and memory are set per run and capped server-side
  (`MAX_CPU_TIME_SEC`, `MAX_WALL_TIME_SEC`, `MAX_MEMORY_MB`). Judge0 enforces them.
- **Validation:** strict zod schemas. Unknown keys are rejected. Source and stdin are limited in bytes.
  Language is a closed enum. Body size is capped at 256 KB.
- **Rate limiting:** per-IP limits on submissions (`RATE_LIMIT_SUBMIT_PER_MIN`) and reads (300/min).
  Set `TRUST_PROXY` to the number of proxies in front of the API so the real client IP is used.
- **Concurrency cap:** `MAX_CONCURRENT_EXECUTIONS` bounds how many runs are in flight.
- **Headers and CORS:** `helmet` defaults; CORS allows only `CORS_ORIGINS`.
- **Secrets:** Judge0 credentials are read from environment variables on the server only. The
  frontend never receives them. Only `VITE_API_BASE_URL` (a public URL) goes in the frontend.
- **Output:** each returned stream is capped at 64 KB.
- **Not yet implemented:** the Stop button only stops polling; the Judge0 run finishes on its own within
  its time limit. Per-user accounts and persistent history need the PostgreSQL store (see
  `src/store/executionStore.ts`).

## Deployment
Deploy this folder as a Node web service (Render, Railway, or Fly.io). Build: `npm install && npm run build`.
Start: `npm start`. Set the variables from `.env.example`. Set `CORS_ORIGINS` to your Vercel URL.
Then set `VITE_API_BASE_URL` in Vercel to this service's URL and redeploy the frontend.

## Not in this phase
SQL and OracleDB (database execution) are not implemented. They need a separate database sandbox, which
is planned for a later phase.
