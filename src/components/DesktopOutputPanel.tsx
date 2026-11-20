import { LANGUAGES, type LanguageId } from '../config/languages';
import type { RunStatus } from '../hooks/useIde';
import type { OutputLine } from '../services/execution';
import { Icon } from './Icon';
import { OutputLines } from './OutputLines';
import { RunningSteps } from './RunningSteps';

interface Props {
  languageId: LanguageId;
  status: RunStatus;
  lines: OutputLine[];
  elapsedMs: number;
  onClear: () => void;
  onCopy: () => void;
}

const STATUS_LABEL: Record<RunStatus, string> = { idle: 'Idle', running: 'Running...', done: 'Executed', stopped: 'Stopped' };
const STATUS_COLOR: Record<RunStatus, string> = { idle: 'text-faint', running: 'text-amber', done: 'text-rust', stopped: 'text-danger' };
const FOOT_LABEL: Record<RunStatus, string> = { idle: 'Idle', running: 'Live Process', done: 'Finished', stopped: 'Stopped' };
const DOT_COLOR: Record<RunStatus, string> = { idle: 'bg-faint', running: 'bg-amber', done: 'bg-amber', stopped: 'bg-danger' };

export function DesktopOutputPanel({ languageId, status, lines, elapsedMs, onClear, onCopy }: Props) {
  const running = status === 'running';
  const runtime = LANGUAGES[languageId].runtime;
  const canClear = !running && (lines.length > 0 || status !== 'idle');
  const canCopy = lines.length > 0 && !running;

  return (
    <section className="flex min-h-[260px] flex-1 flex-col pt-4" aria-label="Output">
      {/* heading + status pill */}
      <div className="flex h-[26px] items-center justify-between">
        <h2 className="flex items-center text-sm font-semibold leading-5 tracking-[0.35px] text-ink">
          Output
          <span className="relative ml-2 flex size-2">
            {running && <span className="absolute inset-0 animate-ping rounded-full bg-amber opacity-75" />}
            <span className="relative size-2 rounded-full bg-amber" />
          </span>
        </h2>
        <div
          className="flex items-center rounded-full border border-line bg-white px-[11px] py-[5px] shadow-hc"
          aria-live="polite"
        >
          {running ? (
            <Icon name="spinner" size={14} strokeWidth={2} className="animate-spin text-amber" />
          ) : (
            <span className="flex size-3.5 items-center justify-center">
              <span className={`size-1.5 rounded-full ${DOT_COLOR[status]}`} />
            </span>
          )}
          <span className="pl-2 font-mono text-[11px] font-medium leading-4 text-muted">Status:</span>
          <span className={`pl-2 font-mono text-[11px] font-semibold leading-4 ${STATUS_COLOR[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      {/* progress track */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" role="presentation">
        {running && (
          <div className="h-full w-1/3 animate-sweep rounded-full bg-gradient-to-r from-amber/0 via-amber to-amber/0" />
        )}
      </div>

      {/* output card */}
      <div className="mt-3 flex min-h-[160px] flex-1 flex-col justify-between rounded-lg border border-line bg-white p-[17px] shadow-hc">
        <div className="min-h-0 overflow-auto">
          {running ? (
            <RunningSteps runtime={runtime} />
          ) : lines.length > 0 ? (
            <OutputLines lines={lines} />
          ) : (
            <p className="font-mono text-xs leading-4 text-faint">Output will appear here after you run your code.</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-[13px] font-mono text-[11px] leading-4 text-faint">
          <span>Time Elapsed: {(elapsedMs / 1000).toFixed(2)}s</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClear}
              disabled={!canClear}
              className="flex items-center gap-1 text-taupe enabled:hover:text-ink disabled:opacity-40"
            >
              <Icon name="trash" size={12} /> Clear logs
            </button>
            <button
              type="button"
              onClick={onCopy}
              disabled={!canCopy}
              className="flex items-center gap-1 font-semibold text-rust enabled:hover:text-ink disabled:opacity-40"
            >
              <Icon name="copy" size={12} /> Copy result
            </button>
            <span className="flex items-center">
              <span className={`size-1.5 rounded-full ${DOT_COLOR[status]}`} />
              <span className="pl-1.5">{FOOT_LABEL[status]}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
