import type { Ide, MobileView } from '../hooks/useIde';
import { Icon, type IconName } from './Icon';

const TABS: { id: MobileView; label: string; icon: IconName; iconSize: number; grow: string }[] = [
  { id: 'editor', label: 'Editor', icon: 'code', iconSize: 13, grow: 'flex-1' },
  { id: 'stdin', label: 'Stdin', icon: 'sliders', iconSize: 12, grow: 'flex-1' },
  { id: 'output', label: 'Output', icon: 'terminal', iconSize: 13, grow: 'flex-[1.17]' },
];

export function SegmentedSwitcher({ ide }: { ide: Ide }) {
  const live = ide.status !== 'idle';
  return (
    <div className="shrink-0 px-3 pb-2 pt-2.5">
      <div role="tablist" aria-label="View" className="flex items-center rounded-lg border border-line bg-seg p-[5px]">
        {TABS.map((t) => {
          const active = ide.view === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => ide.setView(t.id)}
              className={`flex ${t.grow} items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs leading-4 ${
                active ? 'bg-white font-bold text-rust shadow-hc' : 'font-medium text-cocoa'
              }`}
            >
              <Icon name={t.icon} size={t.iconSize} />
              {t.label}
              {t.id === 'stdin' && ide.stdin.trim() && <span className="size-1.5 rounded-full bg-tan" />}
              {t.id === 'output' && live && (
                <span className="flex items-center gap-1 rounded-full border border-amber/40 bg-honey px-[7px] py-[3px]">
                  <span className="size-1.5 rounded-full bg-amber" />
                  <span className="font-mono text-[9px] font-bold leading-4 text-ink">live</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
