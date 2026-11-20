import type { Ide } from '../hooks/useIde';
import { Icon } from './Icon';
import { LanguageSelect } from './LanguageSelect';
import { SettingsPopover } from './SettingsPopover';

const iconButton = 'flex h-8 w-9 items-center justify-center rounded-md text-muted hover:bg-panel';

export function DesktopHeader({ ide }: { ide: Ide }) {
  const running = ide.status === 'running';

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-cream px-4 shadow-hc">
      {/* Left: brand + language + editor controls */}
      <div className="flex items-center">
        <div className="mr-3 flex items-center border-r border-line pr-[13px]">
          <div className="flex size-7 items-center justify-center rounded-md bg-amber text-white shadow-hc">
            <Icon name="bolt" size={16} filled strokeWidth={1.5} />
          </div>
          <span className="pl-2 text-base font-bold leading-4 tracking-[-0.4px] text-ink">
            Happ<span className="text-amber">Code</span>
          </span>
        </div>

        <div className="ml-3">
          <LanguageSelect value={ide.languageId} onChange={ide.changeLanguage} variant="desktop" />
        </div>

        <div className="ml-3 flex items-center pl-1">
          <button
            type="button"
            onClick={ide.saveDraft}
            title="Save draft (Ctrl+S)"
            aria-label="Save draft"
            className="flex items-center rounded-md px-2.5 py-1.5 text-muted hover:bg-panel"
          >
            <Icon name="save" />
            <span className="ml-1.5 rounded border border-tan bg-line px-[7px] py-[3px] font-mono text-[10px] font-medium leading-[15px] text-ink shadow-hc max-lg:hidden">
              Ctrl+S
            </span>
          </button>
          <button type="button" onClick={ide.downloadCode} title="Download code" aria-label="Download code" className={iconButton}>
            <Icon name="download" />
          </button>
          <button type="button" onClick={ide.resetCode} title="Reset code" aria-label="Reset code" className={iconButton}>
            <Icon name="refresh" />
          </button>
          <SettingsPopover settings={ide.settings} onChange={ide.setSettings} />
        </div>
      </div>

      {/* Right: Run / Stop + Trace Out */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={running ? ide.stop : ide.run}
          className={`flex items-center justify-center rounded-md px-5 py-2 shadow-hc ${
            running ? 'bg-danger text-white' : 'bg-amber text-ink'
          }`}
        >
          <Icon name={running ? 'stop' : 'play'} size={16} filled className="mr-2" />
          <span className="text-sm font-semibold leading-5 tracking-[0.35px]">{running ? 'Stop' : 'Run'}</span>
          <span
            className={`ml-2.5 rounded border px-[7px] py-[3px] font-mono text-[10px] font-semibold leading-5 tracking-[0.25px] max-sm:hidden ${
              running ? 'border-white/20 bg-black/20 text-white' : 'border-ink/10 bg-black/5 text-ink'
            }`}
          >
            {running ? 'Esc' : 'Ctrl+↵'}
          </span>
        </button>

        <button
          type="button"
          onClick={ide.traceOut}
          aria-label="Trace Out"
          className="ml-3 flex items-center rounded-md border border-line bg-white px-[17px] py-[9px] shadow-hc max-lg:px-3"
        >
          <Icon name="eye" />
          <span className="pl-2 text-sm font-bold leading-5 text-ink max-lg:hidden">Trace Out</span>
        </button>
      </div>
    </header>
  );
}
