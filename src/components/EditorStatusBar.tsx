import type { CursorPos } from '../hooks/useIde';

interface Props {
  statusLabel: string;
  tabSize: number;
  cursor: CursorPos;
}

export function EditorStatusBar({ statusLabel, tabSize, cursor }: Props) {
  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-line bg-panel px-4 text-[11px] leading-[16.5px] text-muted">
      <div className="flex items-center">
        <span>{statusLabel}</span>
        <span className="pl-4">UTF-8</span>
      </div>
      <div className="flex items-center">
        <span>Spaces: {tabSize}</span>
        <span className="pl-3">
          Ln {cursor.line}, Col {cursor.col}
        </span>
      </div>
    </footer>
  );
}
