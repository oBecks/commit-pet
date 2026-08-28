export function Bar({
  progress,
  fillClassName = "bg-dash-accent",
}: {
  /** 0–1 */
  progress: number;
  fillClassName?: string;
}) {
  const width = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-dash-track shadow-[inset_0_1px_2px_rgba(43,33,21,0.1)]">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${fillClassName}`}
        style={{ width }}
      />
    </div>
  );
}
