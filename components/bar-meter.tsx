import { cn } from "@/lib/utils";

function barColor(value: number): string {
  if (value >= 75) return "#22c55e";
  if (value >= 55) return "#EB5815";
  if (value >= 35) return "#eab308";
  return "#ef4444";
}

export function BarMeter({ value, showColor = true }: { value: number; showColor?: boolean }) {
  const clamped = Math.max(4, Math.min(100, value));
  const color = showColor ? barColor(value) : "#EB5815";
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#1b2538]")}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

