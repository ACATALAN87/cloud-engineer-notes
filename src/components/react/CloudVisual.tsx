import { useState, useRef, useEffect } from 'react';

/**
 * CloudVisual
 *
 * Hero-side animated cloud architecture illustration.
 *
 * Layers:
 *   1. A central "core" representing the Azure region with a soft pulsing glow.
 *   2. Six service nodes orbiting around it (compute, network, storage,
 *      security, devops, identity) with idle floating motion.
 *   3. Animated SVG connection paths between core ↔ services with a
 *      travelling data dot that loops every few seconds.
 *   4. Hover interactivity on each node reveals a small label/tooltip and
 *      highlights its connection.
 *
 * Design goals:
 *   - Sits ABOVE the existing particle canvas but pointer-events confined
 *     to the nodes so the background stays interactive.
 *   - Responsive: scales fluidly inside its parent box; hides decorative
 *     orbits below `sm` for clarity.
 *   - Honours prefers-reduced-motion: pauses orbits and data flow.
 */

interface Service {
  id:        string;
  label:     string;
  short:     string;
  hint:      string;
  /** orbit position in degrees, 0 = top, clockwise */
  angle:     number;
  /** Tailwind gradient classes for the node icon */
  accent:    string;
  /** Glow color (rgba) */
  glow:      string;
  icon:      React.ReactNode;
}

const SERVICES: Service[] = [
  {
    id: 'compute',
    label: 'Compute',
    short: 'AKS · App Service · VMs',
    hint: 'Workloads escalables sobre Kubernetes, PaaS y VMs',
    angle: 0,
    accent: 'from-blue-400 to-cyan-400',
    glow: 'rgba(59, 130, 246, 0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'network',
    label: 'Network',
    short: 'VNet · Firewall · ER',
    hint: 'Hub-and-spoke, Private Endpoints y Azure Firewall',
    angle: 60,
    accent: 'from-violet-400 to-fuchsia-400',
    glow: 'rgba(168, 85, 247, 0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    id: 'storage',
    label: 'Storage',
    short: 'Blob · Files · Disks',
    hint: 'Almacenamiento cifrado, versionado y con Private Link',
    angle: 120,
    accent: 'from-cyan-400 to-emerald-400',
    glow: 'rgba(34, 211, 238, 0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        <path d="M3 12a9 3 0 0 0 18 0" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    short: 'Defender · Key Vault',
    hint: 'Defense-in-depth con Defender for Cloud y RBAC',
    angle: 180,
    accent: 'from-emerald-400 to-teal-400',
    glow: 'rgba(16, 185, 129, 0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'devops',
    label: 'DevOps',
    short: 'Pipelines · IaC · CI/CD',
    hint: 'Terraform con OIDC y pipelines declarativos',
    angle: 240,
    accent: 'from-amber-400 to-orange-400',
    glow: 'rgba(245, 158, 11, 0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
      </svg>
    ),
  },
  {
    id: 'identity',
    label: 'Identity',
    short: 'Entra ID · PIM · RBAC',
    hint: 'SSO empresarial con MFA y acceso JIT',
    angle: 300,
    accent: 'from-rose-400 to-pink-400',
    glow: 'rgba(244, 63, 94, 0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </svg>
    ),
  },
];

/** Convert polar (angle deg, radius) → cartesian relative to center (cx, cy) */
function polar(cx: number, cy: number, angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * radius,
    y: cy + Math.sin(rad) * radius,
  };
}

export default function CloudVisual() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active,  setActive]  = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Auto-rotate which connection "pulses" — gives a sense of activity even
  // without hover. Disabled by prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % SERVICES.length);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  // SVG viewbox setup — square so it scales evenly.
  const SIZE = 480;
  const CX   = SIZE / 2;
  const CY   = SIZE / 2;
  const RADIUS = 165;
  const CORE = 56;

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto aspect-square w-full max-w-[460px]"
      aria-label="Visualización interactiva de servicios cloud Azure"
    >
      {/* Soft background glow behind the whole cloud */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at center, rgba(59,130,246,0.18), transparent 65%)',
          filter: 'blur(10px)',
        }}
      />

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative h-full w-full"
        role="img"
      >
        <defs>
          {/* Gradient used for orbit rings and core */}
          <radialGradient id="coreGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.95"/>
            <stop offset="55%"  stopColor="#3b82f6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4"/>
          </radialGradient>
          <radialGradient id="coreHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"   stopColor="rgba(96,165,250,0.55)"/>
            <stop offset="100%" stopColor="rgba(96,165,250,0)"/>
          </radialGradient>
          <linearGradient id="orbitLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%"   stopColor="rgba(96,165,250,0.45)"/>
            <stop offset="50%"  stopColor="rgba(168,85,247,0.35)"/>
            <stop offset="100%" stopColor="rgba(34,211,238,0.45)"/>
          </linearGradient>

          {/* Per-service gradients for the data dot */}
          {SERVICES.map((s) => (
            <radialGradient key={`grad-${s.id}`} id={`dot-${s.id}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="1"/>
              <stop offset="70%"  stopColor="rgba(255,255,255,0.5)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
          ))}

          <filter id="coreBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4"/>
          </filter>
        </defs>

        {/* === Outer halo behind the core === */}
        <circle cx={CX} cy={CY} r={CORE * 2.6} fill="url(#coreHalo)" className="animate-pulse-glow"/>

        {/* === Decorative orbit rings === */}
        <circle
          cx={CX} cy={CY}
          r={RADIUS}
          fill="none"
          stroke="url(#orbitLine)"
          strokeWidth="0.6"
          strokeDasharray="2 5"
          opacity="0.45"
          className="orbit-rotate-slow"
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
        <circle
          cx={CX} cy={CY}
          r={RADIUS - 40}
          fill="none"
          stroke="url(#orbitLine)"
          strokeWidth="0.4"
          strokeDasharray="1 4"
          opacity="0.3"
          className="orbit-rotate-fast"
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* === Connection lines from core to each service === */}
        {SERVICES.map((s, idx) => {
          const p = polar(CX, CY, s.angle, RADIUS);
          const isActive = active === idx || hovered === s.id;
          return (
            <line
              key={`line-${s.id}`}
              x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke={isActive ? `rgba(255,255,255,0.6)` : 'rgba(96,165,250,0.22)'}
              strokeWidth={isActive ? 1.2 : 0.7}
              strokeDasharray={isActive ? '0' : '3 5'}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
            />
          );
        })}

        {/* === Animated data dots travelling along each connection === */}
        {SERVICES.map((s, idx) => {
          const p = polar(CX, CY, s.angle, RADIUS);
          // Stagger animations so they don't all fire simultaneously
          const delay = (idx * 0.5).toFixed(2);
          return (
            <circle
              key={`dot-${s.id}`}
              r="4"
              fill={`url(#dot-${s.id})`}
              className="data-dot"
              style={{
                offsetPath: `path("M ${CX} ${CY} L ${p.x} ${p.y}")`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* === Service nodes === */}
        {SERVICES.map((s) => {
          const p = polar(CX, CY, s.angle, RADIUS);
          const isHovered = hovered === s.id;
          return (
            <g
              key={s.id}
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer service-node"
              style={{ pointerEvents: 'auto' }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.id)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              role="button"
              aria-label={`${s.label}: ${s.short}`}
            >
              {/* Glow when hovered */}
              {isHovered && (
                <circle r="34" fill={s.glow} opacity="0.5" filter="url(#coreBlur)"/>
              )}
              {/* Outer ring */}
              <circle
                r={isHovered ? 30 : 26}
                fill="rgba(15, 23, 42, 0.85)"
                stroke="rgba(96, 165, 250, 0.5)"
                strokeWidth="1"
                style={{ transition: 'r 0.25s ease' }}
              />
              {/* Inner gradient disk */}
              <foreignObject x="-18" y="-18" width="36" height="36" style={{ pointerEvents: 'none' }}>
                <div
                  className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${s.accent} text-white`}
                  style={{
                    boxShadow: isHovered
                      ? `0 0 24px ${s.glow}`
                      : `0 4px 12px -4px ${s.glow}`,
                    transition: 'box-shadow 0.25s ease',
                  }}
                >
                  <div className="h-[18px] w-[18px]">{s.icon}</div>
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* === Central core === */}
        <g style={{ pointerEvents: 'none' }}>
          <circle cx={CX} cy={CY} r={CORE} fill="url(#coreGrad)" />
          <circle cx={CX} cy={CY} r={CORE} fill="none" stroke="rgba(147,197,253,0.6)" strokeWidth="1" />
          {/* Core icon: stylized Azure cloud */}
          <foreignObject x={CX - 26} y={CY - 26} width="52" height="52">
            <div className="flex h-full w-full items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6.5 6.5 0 0 0 4 12.5a5.5 5.5 0 0 0 5.5 5.5z" />
              </svg>
            </div>
          </foreignObject>
        </g>

        {/* Tag below the core */}
        <text
          x={CX}
          y={CY + CORE + 22}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="10"
          fill="#94a3b8"
          letterSpacing="2"
        >
          AZURE · REGION
        </text>
      </svg>

      {/* === Tooltip for hovered service === */}
      {hovered && (() => {
        const s = SERVICES.find((x) => x.id === hovered)!;
        return (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            aria-hidden="true"
          >
            <div className="glass-card rounded-xl px-4 py-3 text-center w-[200px]">
              <p className="text-sm font-semibold text-white">{s.label}</p>
              <p className="mt-0.5 font-mono text-[10px] text-blue-300">{s.short}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-slate-400">{s.hint}</p>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes orbit-rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-rotate-fast { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes dot-travel        { 0% { offset-distance: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        @keyframes node-float        { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

        .orbit-rotate-slow { animation: orbit-rotate-slow 60s linear infinite; }
        .orbit-rotate-fast { animation: orbit-rotate-fast 35s linear infinite; }
        .data-dot {
          animation: dot-travel 3.6s linear infinite;
          offset-rotate: 0deg;
        }
        .service-node {
          animation: node-float 5s ease-in-out infinite;
        }
        .service-node:nth-child(odd)  { animation-delay: -1.5s; }
        .service-node:focus { outline: none; }
        .service-node:focus-visible > circle:nth-of-type(2) {
          stroke: #60a5fa;
          stroke-width: 2;
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit-rotate-slow,
          .orbit-rotate-fast,
          .data-dot,
          .service-node { animation: none; }
        }
      `}</style>
    </div>
  );
}
