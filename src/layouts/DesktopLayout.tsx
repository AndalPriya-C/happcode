import { CodeEditor } from '../components/CodeEditor';
import { DesktopHeader } from '../components/DesktopHeader';
import { DesktopOutputPanel } from '../components/DesktopOutputPanel';
import { EditorStatusBar } from '../components/EditorStatusBar';
import { SplitPane } from '../components/SplitPane';
import { StdinPanel } from '../components/StdinPanel';
import type { Ide } from '../hooks/useIde';

/** ≥768px. Side-by-side ≥1024px (Figma desktop); stacked on tablets. */
export function DesktopLayout({ ide, stacked }: { ide: Ide; stacked: boolean }) {
  return (
    <div className="flex h-dvh flex-col bg-cream font-jakarta">
      <DesktopHeader ide={ide} />

      <div className="min-h-0 flex-1">
        <SplitPane
          orientation={stacked ? 'vertical' : 'horizontal'}
          initialRatio={stacked ? 0.55 : 0.516}
          first={
            <div className="flex h-full flex-col bg-white">
              <div className="min-h-0 flex-1">
                <CodeEditor
                  languageId={ide.languageId}
                  value={ide.code}
                  settings={ide.settings}
                  autoFocus
                  onChange={ide.setCode}
                  onRun={ide.run}
                  onSave={ide.saveDraft}
                  onCursor={ide.setCursor}
                />
              </div>
              <EditorStatusBar statusLabel={ide.config.statusLabel} tabSize={ide.settings.tabSize} cursor={ide.cursor} />
            </div>
          }
          second={
            <div className="flex h-full flex-col overflow-auto bg-cream p-4">
              <StdinPanel value={ide.stdin} onChange={ide.setStdin} />
              <DesktopOutputPanel
                languageId={ide.languageId}
                status={ide.status}
                lines={ide.lines}
                elapsedMs={ide.elapsedMs}
                onClear={ide.clearOutput}
                onCopy={ide.copyOutput}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
