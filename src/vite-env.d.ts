/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the HappCode API, e.g. https://happcode-api.onrender.com (no trailing slash). */
  readonly VITE_API_BASE_URL?: string;
  /** "http" (default, real execution) or "mock" (Phase 1 sample output for UI work). */
  readonly VITE_EXECUTION_MODE?: 'http' | 'mock';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
