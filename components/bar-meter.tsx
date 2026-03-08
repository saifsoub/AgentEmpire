export function BarMeter({ value }: { value: number }) {
  const clamped = Math.max(6, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-[#1b2538]" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}
