import { useEffect, useRef, useState } from 'react';
import { LANGUAGE_ORDER, LANGUAGES, type LanguageId } from '../config/languages';
import { Icon } from './Icon';

interface Props {
  value: LanguageId;
  onChange: (id: LanguageId) => void;
  variant: 'desktop' | 'mobile';
}

export function LanguageSelect({ value, onChange, variant }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const desktop = variant === 'desktop';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${LANGUAGES[value].label}`}
        onClick={() => setOpen((o) => !o)}
        className={
          desktop
            ? 'flex items-center rounded-md border border-line bg-white px-[15px] py-[7px] text-sm font-semibold text-ink'
            : 'flex h-9 items-center gap-1.5 rounded border border-line bg-white px-[11px] font-mono text-xs font-semibold text-ink'
        }
      >
        {!desktop && <Icon name="terminal" size={13} strokeWidth={2} />}
        <span className={desktop ? 'leading-5' : 'leading-4'}>{LANGUAGES[value].label}</span>
        <Icon name="chevronDown" size={desktop ? 16 : 10} className={desktop ? 'ml-2 text-muted' : 'text-muted'} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className={`absolute z-30 mt-1 max-h-72 w-44 overflow-auto rounded-lg border border-line bg-white p-1 shadow-lg ${
            desktop ? 'left-0' : 'right-0'
          }`}
        >
          {LANGUAGE_ORDER.map((id) => {
            const selected = id === value;
            return (
              <li key={id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm ${
                    selected ? 'bg-honey font-semibold text-ink' : 'text-ink hover:bg-subbar'
                  }`}
                >
                  {LANGUAGES[id].label}
                  {selected && <Icon name="check" size={14} className="text-amber" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
