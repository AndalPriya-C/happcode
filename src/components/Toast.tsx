export function Toast({ message, mobile }: { message?: string; mobile: boolean }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white shadow-lg ${
        mobile ? 'bottom-[72px]' : 'bottom-6'
      }`}
    >
      {message}
    </div>
  );
}
