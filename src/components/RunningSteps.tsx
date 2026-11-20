import { Icon } from './Icon';

/** The "running" log from the Figma desktop frame. */
export function RunningSteps({ runtime }: { runtime: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <Icon name="spinner" size={16} strokeWidth={2} className="animate-spin text-amber" />
        <p className="pl-2 font-mono text-xs font-medium leading-4 text-amber">Compiling &amp; Executing in {runtime}...</p>
      </div>
      <p className="pl-6 font-mono text-xs leading-4 text-faint">Allocating runtime container sandbox</p>
      <p className="pl-6 font-mono text-xs leading-4 text-faint">Executing interpreter instructions...</p>
    </div>
  );
}
