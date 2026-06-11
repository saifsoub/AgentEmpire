import Link from "next/link";
import { Landmark, GraduationCap, Palmtree, Mountain, Waves, Sparkles, Clapperboard, Sun, ArrowRight } from "lucide-react";
import { CITY_NAME, CITY_TAGLINE, cityLandmarks, cityWeather, type CityLandmark } from "@/lib/city-world";

const KIND_ICON: Record<CityLandmark["kind"], React.ComponentType<{ className?: string }>> = {
  sign: Clapperboard,
  boulevard: Palmtree,
  beach: Waves,
  district: Landmark,
  nature: Mountain,
  culture: Sparkles,
  institution: GraduationCap,
};

// Buildings of the skyline. `depth: true` adds a lighter side face for the
// city's "diverse 3D architecture" look.
const TOWERS = [
  { x: 110, w: 38, h: 120, depth: true },
  { x: 165, w: 26, h: 88, depth: false },
  { x: 205, w: 46, h: 150, depth: true },
  { x: 270, w: 30, h: 104, depth: false },
  { x: 318, w: 54, h: 176, depth: true },
  { x: 392, w: 32, h: 96, depth: false },
  { x: 440, w: 44, h: 138, depth: true },
  { x: 502, w: 28, h: 80, depth: false },
  { x: 548, w: 60, h: 190, depth: true },
  { x: 628, w: 34, h: 112, depth: false },
  { x: 678, w: 48, h: 146, depth: true },
  { x: 744, w: 30, h: 92, depth: false },
  { x: 792, w: 42, h: 128, depth: true },
];

const PALMS = [70, 250, 430, 610, 790, 960];

function Palm({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 252)`} stroke="#0b2a22" fill="none" strokeWidth="3" strokeLinecap="round">
      <path d="M0 36 C 2 18, 1 10, 0 0" />
      <path d="M0 0 C -10 -6, -20 -6, -26 -1" />
      <path d="M0 0 C -8 -11, -17 -14, -25 -12" />
      <path d="M0 0 C 10 -6, 20 -6, 26 -1" />
      <path d="M0 0 C 8 -11, 17 -14, 25 -12" />
      <path d="M0 0 C -2 -13, -2 -18, 0 -22" />
    </g>
  );
}

function Skyline() {
  return (
    <svg viewBox="0 0 1200 320" className="block w-full" role="img" aria-label={`${CITY_NAME} skyline at sunset`} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="scity-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0f1a" />
          <stop offset="48%" stopColor="#27224a" />
          <stop offset="78%" stopColor="#7a3a2a" />
          <stop offset="100%" stopColor="#EB5815" />
        </linearGradient>
        <linearGradient id="scity-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9542b" />
          <stop offset="100%" stopColor="#103048" />
        </linearGradient>
        <linearGradient id="scity-tower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2740" />
          <stop offset="100%" stopColor="#101728" />
        </linearGradient>
      </defs>

      {/* Sky and setting sun */}
      <rect width="1200" height="248" fill="url(#scity-sky)" />
      <circle cx="930" cy="226" r="44" fill="#ffb46b" opacity="0.9" />
      <circle cx="930" cy="226" r="70" fill="#ffb46b" opacity="0.18" />

      {/* Mountains with the S/ Sign */}
      <path d="M0 248 L120 142 L230 248 Z" fill="#141d31" />
      <path d="M150 248 L300 116 L470 248 Z" fill="#19233a" />
      <path d="M380 248 L500 168 L620 248 Z" fill="#141d31" />
      <text x="300" y="170" textAnchor="middle" fontSize="34" fontWeight="800" fill="#F3F6FB" letterSpacing="4" style={{ fontFamily: "ui-sans-serif, system-ui" }}>S/</text>
      <rect x="284" y="176" width="34" height="3" fill="#F3F6FB" opacity="0.55" />

      {/* Skyline towers */}
      {TOWERS.map((t, i) => (
        <g key={i}>
          {t.depth && <path d={`M${t.x + t.w} ${248 - t.h} l14 -10 v${t.h - 12} l-14 22 Z`} fill="#2a3654" />}
          <rect x={t.x} y={248 - t.h} width={t.w} height={t.h} fill="url(#scity-tower)" stroke="#27324A" strokeWidth="1" />
          {Array.from({ length: Math.floor(t.h / 26) }).map((_, row) => (
            <rect key={row} x={t.x + 6} y={248 - t.h + 10 + row * 26} width={t.w - 12} height={5} fill="#ffb46b" opacity={row % 2 ? 0.32 : 0.18} />
          ))}
        </g>
      ))}

      {/* Bay and Executive District beach */}
      <rect x="850" y="248" width="350" height="72" fill="url(#scity-sea)" />
      <path d="M850 248 Q 1000 238 1200 250 L1200 268 Q 1010 256 850 262 Z" fill="#e9c08c" />
      <path d="M870 256 q20 4 40 0 M930 260 q24 4 48 0 M1020 256 q20 4 40 0" stroke="#ffd9a8" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Sunset Boulevard */}
      <rect x="0" y="262" width="880" height="58" fill="#101728" />
      <path d="M20 292 H840" stroke="#EB5815" strokeWidth="3" strokeDasharray="26 18" opacity="0.7" />
      {PALMS.map((x) => (x < 880 ? <Palm key={x} x={x} /> : null))}
      <Palm x={1080} />
    </svg>
  );
}

export function SCityWorld() {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <div className="relative">
          <Skyline />
          <div className="absolute left-5 top-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">Welcome to</div>
            <div className="text-3xl font-bold text-primary drop-shadow">{CITY_NAME}</div>
          </div>
          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-xl border border-border bg-app/70 px-3 py-2 backdrop-blur">
            <Sun className="h-4 w-4 text-accent" />
            <div className="text-xs text-secondary">
              <span className="font-semibold text-primary">{cityWeather.temperatureC}°C</span> · {cityWeather.condition}
            </div>
          </div>
        </div>
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm text-secondary">{CITY_TAGLINE} {cityWeather.summary} — the diverse cultural scene, rich with art, food, and fashion, reflects a dynamic, multicultural population of agents and humans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cityLandmarks.map((landmark) => {
          const Icon = KIND_ICON[landmark.kind];
          const body = (
            <div className="group h-full rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/50 hover:bg-surface2">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-primary">{landmark.name}</span>
                {landmark.href && <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted transition group-hover:text-accent" />}
              </div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{landmark.tagline}</div>
              <p className="text-xs leading-relaxed text-secondary">{landmark.description}</p>
            </div>
          );
          return landmark.href ? (
            <Link key={landmark.id} href={landmark.href} className="block h-full">{body}</Link>
          ) : (
            <div key={landmark.id}>{body}</div>
          );
        })}
      </div>
    </section>
  );
}
