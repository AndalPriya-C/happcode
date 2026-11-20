import type { Ide, MobileView } from '../hooks/useIde';
import { Icon, type IconName } from './Icon';

const ITEMS: { id: MobileView; label: string; icon: IconName; size: number }[] = [
  { id: 'editor', label: 'Editor', icon: 'code', size: 17 },
  { id: 'stdin', label: 'Stdin', icon: 'login', size: 17 },
  { id: 'output', label: 'Console', icon: 'terminal', size: 17 },
];

export function BottomNav({ ide }: { ide: Ide }) {
  return (
    <nav
      aria-label="Primary"
      className="relative z-20 shrink-0 bg-cream-m/90 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-14 items-center justify-center border-t border-line bg-[rgba(251,248,242,0.95)] px-2 pt-px backdrop-blur-md">
        {ITEMS.map((item) => {
          const active = ide.view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => ide.setView(item.id)}
              className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded text-xs leading-4 tracking-[-0.3px] ${
                active ? 'border border-line bg-white font-bold text-ink' : 'font-normal text-cocoa'
              }`}
            >
              <Icon name={item.icon} size={item.size} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
