/**
 * Supported languages. Ids match the frontend (src/config/languages.ts).
 * judge0Match is tested against names from Judge0's GET /languages, so the server never
 * hard-codes Judge0 numeric ids. A language is enabled only if its runtime is found there.
 */
export const LANGUAGE_IDS = [
  'cpp',
  'python3',
  'pypy3',
  'c',
  'java',
  'csharp',
  'javascript',
  'go',
  'typescript',
  'php',
  'kotlin',
  'rust',
  'r',
] as const;

export type LanguageId = (typeof LANGUAGE_IDS)[number];

export interface LanguageSpec {
  id: LanguageId;
  label: string;
  /** Pattern for the Judge0 language name. null = enabled only through an env override. */
  judge0Match: RegExp | null;
}

export const LANGUAGES: Record<LanguageId, LanguageSpec> = {
  cpp: { id: 'cpp', label: 'C++', judge0Match: /^C\+\+ \(GCC/ },
  python3: { id: 'python3', label: 'Python 3', judge0Match: /^Python \(3\./ },
  pypy3: { id: 'pypy3', label: 'PyPy 3', judge0Match: null },
  c: { id: 'c', label: 'C', judge0Match: /^C \(GCC/ },
  java: { id: 'java', label: 'Java', judge0Match: /^Java \(/ },
  csharp: { id: 'csharp', label: 'C#', judge0Match: /^C# \(/ },
  javascript: { id: 'javascript', label: 'JavaScript', judge0Match: /^JavaScript \(/ },
  go: { id: 'go', label: 'Go', judge0Match: /^Go \(/ },
  typescript: { id: 'typescript', label: 'TypeScript', judge0Match: /^TypeScript \(/ },
  php: { id: 'php', label: 'PHP', judge0Match: /^PHP \(/ },
  kotlin: { id: 'kotlin', label: 'Kotlin', judge0Match: /^Kotlin \(/ },
  rust: { id: 'rust', label: 'Rust', judge0Match: /^Rust \(/ },
  r: { id: 'r', label: 'R', judge0Match: /^R \(/ },
};
