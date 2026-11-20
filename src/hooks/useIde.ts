import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageId } from '../config/languages';
import { executionService } from '../services';
import type { OutputLine, RunMetrics } from '../services/execution';

export type RunStatus = 'idle' | 'running' | 'done' | 'stopped';
export type MobileView = 'editor' | 'stdin' | 'output';
export interface EditorSettings {
  fontSize: number;
  tabSize: number;
}
export interface CursorPos {
  line: number;
  col: number;
}

type Codes = Partial<Record<LanguageId, string>>;
interface Draft {
  languageId: LanguageId;
  codes: Codes;
  stdin: string;
}

const DRAFT_KEY = 'happcode:draft:v1';

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    return d && d.languageId in LANGUAGES ? d : null;
  } catch {
    return null;
  }
}

/** Single source of truth for IDE state + actions. Layouts are purely presentational. */
export function useIde() {
  const [draft] = useState(loadDraft);
  const [languageId, setLanguageId] = useState<LanguageId>(draft?.languageId ?? DEFAULT_LANGUAGE);
  const [codes, setCodes] = useState<Codes>(draft?.codes ?? {});
  const [stdin, setStdin] = useState(draft?.stdin ?? '');
  const [status, setStatus] = useState<RunStatus>('idle');
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [metrics, setMetrics] = useState<RunMetrics | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [settings, setSettings] = useState<EditorSettings>({ fontSize: 14, tabSize: 4 });
  const [cursor, setCursor] = useState<CursorPos>({ line: 1, col: 1 });
  const [view, setView] = useState<MobileView>('editor');
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const config = LANGUAGES[languageId];
  const code = codes[languageId] ?? config.template;

  const latest = useRef({ languageId, code, codes, stdin, status });
  latest.current = { languageId, code, codes, stdin, status };
  const abortRef = useRef<AbortController | null>(null);

  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const setCode = useCallback((value: string) => {
    setCodes((prev) => ({ ...prev, [latest.current.languageId]: value }));
  }, []);

  const changeLanguage = useCallback((id: LanguageId) => {
    abortRef.current?.abort();
    setLanguageId(id);
  }, []);

  const run = useCallback(async () => {
    if (abortRef.current) return; // already running
    const controller = new AbortController();
    abortRef.current = controller;
    const { languageId: lid, code: c, stdin: s } = latest.current;

    setStatus('running');
    setLines([]);
    setMetrics(null);
    setElapsedMs(0);
    setView('output');

    const started = performance.now();
    const timer = window.setInterval(() => setElapsedMs(performance.now() - started), 100);
    try {
      const result = await executionService.run({ languageId: lid, code: c, stdin: s }, controller.signal);
      setLines(result.lines.map((l, i) => ({ ...l, id: i })));
      setMetrics(result.metrics);
      setElapsedMs(result.metrics?.durationMs ?? 0);
      setStatus('done');
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') {
        setStatus('stopped');
        setLines([{ id: 0, kind: 'exit', text: '[Execution stopped by user]' }]);
      } else {
        setStatus('done');
        setLines([{ id: 0, kind: 'exit', text: '[Execution failed: unexpected error]' }]);
      }
    } finally {
      window.clearInterval(timer);
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const resetCode = useCallback(() => {
    setCodes((prev) => ({ ...prev, [latest.current.languageId]: LANGUAGES[latest.current.languageId].template }));
    notify('Code reset to the starter template');
  }, [notify]);

  const clearOutput = useCallback(() => {
    if (latest.current.status === 'running') return;
    setLines([]);
    setMetrics(null);
    setElapsedMs(0);
    setStatus('idle');
  }, []);

  const copyOutput = useCallback(async () => {
    const text = lines.map((l) => l.text).join('\n');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      notify('Output copied to clipboard');
    } catch {
      notify('Could not access the clipboard');
    }
  }, [lines, notify]);

  const downloadCode = useCallback(() => {
    const { languageId: lid, code: c } = latest.current;
    const url = URL.createObjectURL(new Blob([c], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = LANGUAGES[lid].fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  /** "Save" (Ctrl+S) keeps a draft in this browser's localStorage and restores it on reload. */
  const saveDraft = useCallback(() => {
    const l = latest.current;
    try {
      const data: Draft = {
        languageId: l.languageId,
        codes: { ...l.codes, [l.languageId]: l.code },
        stdin: l.stdin,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      notify('Draft saved in this browser');
    } catch {
      notify('Could not save the draft (storage unavailable)');
    }
  }, [notify]);

  /** Placeholder until the execution backend exists. */
  const traceOut = useCallback(() => notify('Trace Out needs the execution backend (Phase 2)'), [notify]);
  const openProfile = useCallback(() => notify('Accounts are not part of Phase 1'), [notify]);

  // Global shortcuts (when focus is outside Monaco; Monaco registers its own and calls preventDefault).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === 'Escape' && latest.current.status === 'running') {
        stop();
      } else if (mod && e.key === 'Enter') {
        e.preventDefault();
        run();
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDraft();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run, stop, saveDraft]);

  return {
    languageId, config, code, stdin, status, lines, metrics, elapsedMs, settings, cursor, view, toast,
    setCode, setStdin, setSettings, setCursor, setView,
    changeLanguage, run, stop, resetCode, clearOutput, copyOutput, downloadCode, saveDraft, traceOut, openProfile,
  };
}

export type Ide = ReturnType<typeof useIde>;
