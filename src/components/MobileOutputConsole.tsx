import { LANGUAGES } from '../config/languages';
import type { Ide, RunStatus } from '../hooks/useIde';
import { Icon } from './Icon';
import { OutputLines } from './OutputLines';
import { RunningSteps } from './RunningSteps';

const STATUS_LABEL: Record<RunStatus, string> = { idle: 'Idle', running: 'Running', done: 'Executed', stopped: 'Stopped' };

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center rounded border border-line bg-subbar p-[9px]">
      <span className="font-mono text-[10px] leading-[15px] text-taupe">{label}</span>
      <span className={`pt-0.5 text-sm font-bold leading-5 ${accent ? 'text-rust' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

export function MobileOutputConsole({ ide }: { ide: Ide }) {
  const { status, metrics, lines } = ide;
  const running = status === 'running';
  const canClear = !running && (lines.length > 0 || status !== 'idle');
  const canCopy = !running && lines.length > 0;
  const exit = metrics && metrics.exitCode !== null ? `${metrics.exitCode} (${metrics.exitCode === 0 ? 'OK' : 'ERR'})` : '—';

  return (
    <div className="flex flex-col gap-2">
      <section aria-label="Output console" className="overflow-hidden rounded-lg border border-line bg-white p-px">
        {/* title bar */}
        <div className="flex items-center justify-between border-b border-line bg-subbar px-3 pb-[9px] pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-amber" />
              <span className="size-2.5 rounded-full bg-tan" />
              <span className="size-2.5 rounded-full bg-line" />
            </div>
            <span className="pl-1 font-mono text-xs font-semibold leading-4 text-ink">Output Console</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-amber/40 bg-honey px-[9px] py-[3px]" aria-live="polite">
            <span className={`size-1.5 rounded-full ${status === 'stopped' ? 'bg-danger' : 'bg-amber'}`} />
            <span className="font-mono text-[10px] font-bold leading-[15px] text-ink">{STATUS_LABEL[status]}</span>
          </div>
        </div>

        {/* meta bar */}
        <div className="flex items-center justify-between border-b border-line bg-subbar/60 px-3 pb-[7px] pt-1.5 font-mono text-[11px] leading-[16.5px] text-taupe">
          <div className="flex items-center gap-2">
            <span>
              Exit: <b className="font-bold text-rust">{exit}</b>
            </span>
            <span>•</span>
            <span>
              Time: <b className="font-semibold text-ink">{(ide.elapsedMs / 1000).toFixed(2)}s</b>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold leading-[15px] text-cocoa">
            <Icon name="cpu" size={11} className="text-amber" />
            {metrics?.memoryMb != null ? `${metrics.memoryMb} MB` : '— MB'}
          </div>
        </div>

        {/* body */}
        <div className="min-h-[220px] overflow-auto bg-white px-3 pb-5 pt-[11.25px]">
          {running ? (
            <RunningSteps runtime={LANGUAGES[ide.languageId].runtime} />
          ) : lines.length > 0 ? (
            <OutputLines lines={lines} />
          ) : (
            <p className="font-mono text-xs leading-[19.5px] text-taupe">Output will appear here after you run your code.</p>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-line bg-subbar px-3 pb-2 pt-[9px]">
          <button
            type="button"
            onClick={ide.clearOutput}
            disabled={!canClear}
            className="flex items-center gap-1 font-mono text-xs leading-4 text-taupe disabled:opacity-40"
          >
            <Icon name="trash" size={13} /> Clear logs
          </button>
          <button
            type="button"
            onClick={ide.copyOutput}
            disabled={!canCopy}
            className="flex items-center gap-1 font-mono text-xs font-semibold leading-4 text-rust disabled:opacity-40"
          >
            <Icon name="copy" size={12} /> Copy result
          </button>
        </div>
      </section>

      {/* metrics (sample values from the mock service) */}
      <section aria-label="Runtime metrics" className="flex justify-center gap-2 rounded-lg border border-line bg-white p-[13px]">
        <Tile label="CPU Usage" value={metrics?.cpuPercent != null ? `${metrics.cpuPercent}%` : '—'} />
        <Tile label="Peak RAM" value={metrics?.peakRamMb != null ? `${metrics.peakRamMb} MB` : '—'} />
        <Tile label="Thread ID" value={metrics?.threadId ?? '—'} accent />
      </section>
    </div>
  );
}
