import type { OutputKind, OutputLine } from '../services/execution';

const kindClass: Record<Exclude<OutputKind, 'mock'>, string> = {
  env: 'text-taupe',
  step: 'text-cocoa',
  result: 'pt-[5px] font-bold text-rust',
  exit: 'pt-[9px] text-taupe',
  error: 'whitespace-pre-wrap font-medium text-danger',
};

/** Log text styled exactly like the Figma mobile console (mono 12 / 19.5). */
export function OutputLines({ lines }: { lines: OutputLine[] }) {
  return (
    <div className="flex flex-col gap-[3px] font-mono text-xs leading-[19.5px]">
      {lines.map((l) =>
        l.kind === 'mock' ? (
          // Clearly labels fabricated results (Phase 1).
          <p
            key={l.id}
            className="mb-1 w-fit rounded bg-honey px-2 py-0.5 text-[10px] font-bold uppercase leading-4 tracking-wide text-rust"
          >
            {l.text}
          </p>
        ) : (
          <p key={l.id} className={`whitespace-pre-wrap break-words ${kindClass[l.kind]}`}>
            {l.text}
          </p>
        ),
      )}
    </div>
  );
}
