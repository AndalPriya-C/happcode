import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

interface Props {
  /** 'horizontal' = side by side (desktop). 'vertical' = stacked (tablet). */
  orientation: 'horizontal' | 'vertical';
  initialRatio?: number;
  min?: number;
  first: ReactNode;
  second: ReactNode;
}

const HANDLE = 10; // px, from the Figma splitter bar

export function SplitPane({ orientation, initialRatio = 0.516, min = 0.2, first, second }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(initialRatio);
  const [dragging, setDragging] = useState(false);
  const horizontal = orientation === 'horizontal';

  const clamp = useCallback((v: number) => Math.min(1 - min, Math.max(min, v)), [min]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const pos = horizontal
      ? (e.clientX - r.left - HANDLE / 2) / (r.width - HANDLE)
      : (e.clientY - r.top - HANDLE / 2) / (r.height - HANDLE);
    setRatio(clamp(pos));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dec = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const inc = horizontal ? 'ArrowRight' : 'ArrowDown';
    if (e.key === dec) setRatio((r) => clamp(r - 0.02));
    else if (e.key === inc) setRatio((r) => clamp(r + 0.02));
    else return;
    e.preventDefault();
  };

  const tracks = `minmax(0,${ratio}fr) ${HANDLE}px minmax(0,${1 - ratio}fr)`;

  return (
    <div
      ref={ref}
      className="grid h-full w-full"
      style={horizontal ? { gridTemplateColumns: tracks } : { gridTemplateRows: tracks }}
    >
      <div className="min-h-0 min-w-0">{first}</div>

      <div
        role="separator"
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-label="Resize editor and output panels"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={Math.round(min * 100)}
        aria-valuemax={Math.round((1 - min) * 100)}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={onMove}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setDragging(false);
        }}
        onDoubleClick={() => setRatio(initialRatio)}
        onKeyDown={onKeyDown}
        className={`flex touch-none select-none items-center justify-center bg-panel border-line ${
          horizontal ? 'cursor-col-resize border-x px-px' : 'cursor-row-resize border-y py-px'
        }`}
      >
        <div className={`flex gap-1 ${horizontal ? 'flex-col' : 'flex-row'}`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-1 rounded-full bg-faint" />
          ))}
        </div>
      </div>

      <div className="min-h-0 min-w-0">{second}</div>

      {dragging && <div className="fixed inset-0 z-40" style={{ cursor: horizontal ? 'col-resize' : 'row-resize' }} />}
    </div>
  );
}
