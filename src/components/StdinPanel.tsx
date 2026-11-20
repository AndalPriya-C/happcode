interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Fill the available height (mobile Stdin view). */
  tall?: boolean;
}

export function StdinPanel({ value, onChange, tall }: Props) {
  return (
    <div className={`flex flex-col ${tall ? 'h-full min-h-0' : ''}`}>
      <textarea
        aria-label="Standard input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter Input here"
        spellCheck={false}
        className={`block w-full resize-none rounded-lg border border-line bg-white p-3.5 font-mono text-sm leading-5 text-ink shadow-hc placeholder:text-faint ${
          tall ? 'min-h-[200px] flex-1' : 'h-[136px]'
        }`}
      />
      <div className="mt-2 rounded-lg border border-line bg-white px-[15px] py-[11px]">
        <p className="text-xs leading-4 text-muted max-md:text-taupe">
          If your code takes input, add it in the above box before running.
        </p>
      </div>
    </div>
  );
}
