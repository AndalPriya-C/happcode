import type { Ide } from '../hooks/useIde';
import { Icon } from './Icon';
import { LanguageSelect } from './LanguageSelect';

export function MobileHeader({ ide }: { ide: Ide }) {
  return (
    <header
      className="relative z-20 shrink-0 bg-cream-m/85 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 items-center justify-between border-b border-line bg-[rgba(251,248,242,0.95)] px-3 pb-px backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber text-white shadow-hc">
            <Icon name="bolt" size={20} filled strokeWidth={1.5} />
          </div>
          <div>
            <p className="-mb-px text-base font-bold leading-6 tracking-[-0.4px] text-ink">HappCode</p>
            <p className="font-mono text-[10px] font-semibold uppercase leading-[12.5px] tracking-[0.5px] text-rust">
              IDE • Mobile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelect value={ide.languageId} onChange={ide.changeLanguage} variant="mobile" />
          <button
            type="button"
            onClick={ide.openProfile}
            aria-label="Account"
            className="flex size-8 items-center justify-center rounded-xl border border-line bg-white text-ink"
          >
            <Icon name="user" size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
