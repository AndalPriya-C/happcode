import { useEffect, useRef, useState } from 'react';
import type { EditorSettings } from '../hooks/useIde';
import { Icon } from './Icon';

interface Props {
  settings: EditorSettings;
  onChange: (s: EditorSettings) => void;
}

const TAB_SIZES = [2, 4, 8];

export function SettingsPopover({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const step = (d: number) => onChange({ ...settings, fontSize: Math.min(24, Math.max(11, settings.fontSize + d)) });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Editor settings"
        title="Editor settings"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-9 items-center justify-center rounded-md text-muted hover:bg-panel"
      >
        <Icon name="settings" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Editor settings"
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-line bg-white p-3 shadow-lg"
        >
          <p className="text-xs font-semibold text-ink">Font size</p>
          <div className="mt-1.5 flex items-center gap-2">
            <button type="button" aria-label="Decrease font size" onClick={() => step(-1)} className="size-7 rounded border border-line bg-white text-ink hover:bg-panel">
              −
            </button>
            <span className="w-8 text-center font-mono text-xs text-ink">{settings.fontSize}</span>
            <button type="button" aria-label="Increase font size" onClick={() => step(1)} className="size-7 rounded border border-line bg-white text-ink hover:bg-panel">
              +
            </button>
          </div>

          <p className="mt-3 text-xs font-semibold text-ink">Tab size</p>
          <div className="mt-1.5 flex gap-1.5">
            {TAB_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={settings.tabSize === n}
                onClick={() => onChange({ ...settings, tabSize: n })}
                className={`h-7 flex-1 rounded border font-mono text-xs ${
                  settings.tabSize === n ? 'border-amber bg-honey font-bold text-ink' : 'border-line bg-white text-muted hover:bg-panel'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
