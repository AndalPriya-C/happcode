import { BottomNav } from '../components/BottomNav';
import { CodeEditor } from '../components/CodeEditor';
import { MobileHeader } from '../components/MobileHeader';
import { MobileOutputConsole } from '../components/MobileOutputConsole';
import { MobileSubBar } from '../components/MobileSubBar';
import { SegmentedSwitcher } from '../components/SegmentedSwitcher';
import { StdinPanel } from '../components/StdinPanel';
import type { Ide } from '../hooks/useIde';

/** <768px. Mirrors the Figma "Compiler IDE - Mobile View" frame. */
export function MobileLayout({ ide }: { ide: Ide }) {
  return (
    <div className="flex h-dvh flex-col bg-cream-m font-grotesk">
      <MobileHeader ide={ide} />
      <MobileSubBar ide={ide} />
      <SegmentedSwitcher ide={ide} />

      <main className="flex min-h-0 flex-1 flex-col overflow-auto px-3 pb-6">
        {ide.view === 'editor' && (
          <div className="min-h-[320px] flex-1 overflow-hidden rounded-lg border border-line bg-white">
            <CodeEditor
              languageId={ide.languageId}
              value={ide.code}
              settings={{ ...ide.settings, fontSize: Math.min(ide.settings.fontSize, 14) }}
              onChange={ide.setCode}
              onRun={ide.run}
              onSave={ide.saveDraft}
              onCursor={ide.setCursor}
            />
          </div>
        )}
        {ide.view === 'stdin' && <StdinPanel value={ide.stdin} onChange={ide.setStdin} tall />}
        {ide.view === 'output' && <MobileOutputConsole ide={ide} />}
      </main>

      <BottomNav ide={ide} />
    </div>
  );
}
