import type { Ide } from '../hooks/useIde';
import { Icon, type IconName } from './Icon';

function SquareButton({ icon, label, size, onClick }: { icon: IconName; label: string; size: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded border border-line bg-white text-ink"
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

export function MobileSubBar({ ide }: { ide: Ide }) {
  const running = ide.status === 'running';
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-line bg-subbar px-3 pb-[9px] pt-2">
      <div className="flex items-center gap-1.5 rounded-md border border-line bg-white px-[9px] py-[5px]">
        <span className="size-2 rounded-full bg-amber" />
        <span className="font-mono text-xs font-semibold leading-4 text-ink">{ide.config.fileName}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <SquareButton icon="bookmark" label="Save draft" size={14} onClick={ide.saveDraft} />
        <SquareButton icon="download" label="Download code" size={13} onClick={ide.downloadCode} />
        <SquareButton icon="chart" label="Trace Out" size={14} onClick={ide.traceOut} />
        <button
          type="button"
          onClick={running ? ide.stop : ide.run}
          className={`flex h-8 items-center gap-1.5 rounded px-2.5 font-mono text-xs font-bold ${
            running ? 'bg-danger text-white' : 'bg-amber text-ink'
          }`}
        >
          <Icon name={running ? 'stop' : 'play'} size={10} filled />
          {running ? 'Stop' : 'Run'}
        </button>
      </div>
    </div>
  );
}
