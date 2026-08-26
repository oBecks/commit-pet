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
    <div className="h-2.5 overflow-hidden rounded-full bg-dash-track">
      <div className={`h-full rounded-full ${fillClassName}`} style={{ width }} />
    </div>
  );
}
