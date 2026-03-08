import { cn } from "@/lib/utils";

function scoreLabel(v: number): string {
  if (v >= 90) return "Exceptional";
  if (v >= 75) return "Strong";
  if (v >= 60) return "Good";
  if (v >= 45) return "Building";
  if (v >= 30) return "Early";
  return "Needs Focus";
}

function scoreColor(v: number): string {
  if (v >= 75) return "#22c55e";
  if (v >= 55) return "#EB5815";
  if (v >= 35) return "#eab308";
  return "#ef4444";
}

export function ScoreRing({
  value,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);
  const color = scoreColor(value);
  const label = scoreLabel(value);

  return (
    <div className={cn("relative inline-flex flex-col items-center gap-1", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1b2538"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
          aria-label={`Score: ${value} out of 100`}
        >
          {value}
        </span>
        <span className="mt-0.5 text-xs text-muted">/ 100</span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}

/** Compact inline score badge for tables / lists */
export function ScoreBadge({ value }: { value: number }) {
  const color = scoreColor(value);
  const bg =
    value >= 75
      ? "bg-green-500/15 border-green-500/25"
      : value >= 55
        ? "bg-accent/15 border-accent/25"
        : value >= 35
          ? "bg-yellow-500/15 border-yellow-500/25"
          : "bg-red-500/15 border-red-500/25";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        bg
      )}
      style={{ color }}
    >
      {value}
    </span>
  );
}
