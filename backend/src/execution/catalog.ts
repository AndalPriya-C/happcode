import { config } from '../config.js';
import { LANGUAGES, LANGUAGE_IDS, type LanguageId } from '../languages/registry.js';
import { fetchJudge0Languages } from './judge0.js';

export interface CatalogEntry {
  id: LanguageId;
  label: string;
  available: boolean;
  judge0LanguageId: number | null;
  judge0Name: string | null;
  reason: string | null;
}

const REFRESH_MS = 5 * 60_000;
let entries = new Map<LanguageId, CatalogEntry>();

/**
 * Verifies every language against the live Judge0 instance. A language is enabled only when its
 * runtime id appears in Judge0's /languages response. If Judge0 is unreachable, every language is
 * disabled, so nothing is reported as available without verification.
 */
export async function refreshCatalog(): Promise<void> {
  let remote: { id: number; name: string }[] = [];
  let remoteError: string | null = null;
  try {
    remote = await fetchJudge0Languages();
  } catch (err) {
    remoteError = 'Execution service is unreachable';
    console.error('[catalog] Judge0 /languages failed:', (err as Error).message);
  }

  const next = new Map<LanguageId, CatalogEntry>();
  for (const id of LANGUAGE_IDS) {
    const spec = LANGUAGES[id];
    const override = id === 'pypy3' ? config.PYPY3_JUDGE0_LANGUAGE_ID : undefined;

    let judge0LanguageId: number | null = null;
    let judge0Name: string | null = null;
    if (override !== undefined) {
      judge0LanguageId = override;
      judge0Name = remote.find((l) => l.id === override)?.name ?? null;
    } else if (spec.judge0Match) {
      const hit = remote.find((l) => spec.judge0Match!.test(l.name));
      judge0LanguageId = hit?.id ?? null;
      judge0Name = hit?.name ?? null;
    }

    let reason: string | null = null;
    if (remoteError) reason = remoteError;
    else if (judge0LanguageId === null)
      reason = id === 'pypy3' ? 'Set PYPY3_JUDGE0_LANGUAGE_ID to a PyPy runtime on Judge0' : 'Runtime not installed on the execution service';
    else if (!judge0Name) reason = `Judge0 has no language with id ${judge0LanguageId}`;

    next.set(id, {
      id,
      label: spec.label,
      available: reason === null,
      judge0LanguageId: reason === null ? judge0LanguageId : null,
      judge0Name,
      reason,
    });
  }

  entries = next;
}

export function getCatalog(): CatalogEntry[] {
  return LANGUAGE_IDS.map((id) => getEntry(id));
}

export function getEntry(id: LanguageId): CatalogEntry {
  return (
    entries.get(id) ?? {
      id,
      label: LANGUAGES[id].label,
      available: false,
      judge0LanguageId: null,
      judge0Name: null,
      reason: 'Catalog not loaded yet',
    }
  );
}

export function startCatalogRefresh(): void {
  void refreshCatalog();
  setInterval(() => void refreshCatalog(), REFRESH_MS).unref();
}
