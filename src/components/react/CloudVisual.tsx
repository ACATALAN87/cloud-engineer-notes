import { useEffect, useRef, useState } from 'react';
import { animate, stagger, type AnimationParams } from 'animejs';

/**
 * CloudVisual
 *
 * Hero-side cloud visualisation animated with anime.js v4.
 *
 * Composition (top → bottom inside a 480 × 480 viewBox):
 *
 *   1. Halo + 3 radar rings emanating from the cloud centre.
 *   2. A stylised cloud silhouette ("Azure cloud") that breathes.
 *   3. 6 service tiles arranged in a 3×2 grid below the cloud:
 *        Network · Compute · Storage
 *        Identity · Security · DevOps
 *   4. Curved connectors from the cloud bottom to each tile.
 *   5. Data dots that travel along each connector in a loop.
 *
 * All motion is driven by anime.js timelines so the animations can be
 * paused / cancelled cleanly on unmount and respect prefers-reduced-motion.
 */

interface Service {
  id:     string;
  label:  string;
  short:  string;
  hint:   string;
  /** Centre of the tile in viewBox coordinates */
  x:      number;
  y:      number;
  accent: string; // tailwind gradient classes
  glow:   string; // rgba glow color
  icon:   React.ReactNode;
}

const VB         = 480;
const CLOUD_CX   = 240;
const CLOUD_CY   = 130;
const CLOUD_BASE = 178;          // y of the cloud bottom (where data dots start)
const TILE_W     = 110;
const TILE_H     = 70;

const SERVICES: Service[] = [
  {
    id: 'network', label: 'Network', short: 'VNet · Firewall',
    hint: 'Hub-and-spoke con NSGs y Azure Firewall',
    x: 90,  y: 290,
    accent: 'from-blue-400 to-cyan-400',
    glow:   'rgba(59, 130, 246, 0.55)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18"/>
      </svg>
    ),
  },
  {
    id: 'compute', label: 'Compute', short: 'AKS · App Service',
    hint: 'Workloads sobre Kubernetes y PaaS',
    x: 240, y: 290,
    accent: 'from-violet-400 to-fuchsia-400',
    glow:   'rgba(168, 85, 247, 0.55)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    id: 'storage', label: 'Storage', short: 'Blob · Files · KV',
    hint: 'Almacenamiento privado con Private Endpoints',
    x: 390, y: 290,
    accent: 'from-cyan-400 to-emerald-400',
    glow:   'rgba(34, 211, 238, 0.55)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
        <path d="M3 12a9 3 0 0 0 18 0"/>
      </svg>
    ),
  },
  {
    id: 'identity', label: 'Identity', short: 'Entra ID · PIM',
    hint: 'SSO empresarial con MFA y JIT access',
    x: 90,  y: 400,
    accent: 'from-rose-400 to-pink-500',
    glow:   'rgba(244, 63, 94, 0.55)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>
      </svg>
    ),
  },
  {
    id: 'security', label: 'Security', short: 'Defender · Policy',
    hint: 'Defense-in-depth con CSPM y Azure Policy',
    x: 240, y: 400,
    accent: 'from-emerald-400 to-teal-500',
    glow:   'rgba(16, 185, 129, 0.55)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'devops', label: 'DevOps', short: 'IaC · CI/CD',
    hint: 'Terraform + GitHub Actions con OIDC',
    x: 390, y: 400,
    accent: 'from-amber-400 to-orange-500',
    glow:   'rgba(245, 158, 11, 0.55)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>
      </svg>
    ),
  },
];

/**
 * Build a quadratic-Bezier path from the cloud bottom to a tile top, with
 * the control point pulled outward along the X axis to give the connector
 * a soft sweep instead of a straight line.
 */
function connectorPath(targetX: number, targetY: number): string {
  const startX = CLOUD_CX;
  const startY = CLOUD_BASE;
  const endY   = targetY - TILE_H / 2 - 4;
  const cpX    = startX + (targetX - startX) * 0.5;
  const cpY    = (startY + endY) / 2 - 30;
  return `M ${startX} ${startY} Q ${cpX} ${cpY} ${targetX} ${endY}`;
}

export default function CloudVisual() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // ─── Anime.js orchestration ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Each call returns an Animation; we keep refs to pause them on unmount.
    const animations: ReturnType<typeof animate>[] = [];

    // 1. Cloud "breathing" — gentle scale around its centre.
    animations.push(animate('.cl-cloud', {
      scale:           [1, 1.025, 1],
      duration:        4500,
      ease:            'inOutSine',
      loop:            true,
      transformOrigin: `${CLOUD_CX}px ${CLOUD_CY}px`,
    } as AnimationParams));

    // 2. Halo intensity pulse (separate from the cloud so the glow can
    //    breathe at a different rhythm than the silhouette).
    animations.push(animate('.cl-halo', {
      opacity:  [0.35, 0.65],
      duration: 2800,
      ease:     'inOutSine',
      loop:     true,
      alternate: true,
    } as AnimationParams));

    // 3. Three radar rings emanating from the cloud, staggered so one is
    //    always near the centre and another fading out near the edges.
    animations.push(animate('.cl-radar', {
      r:        [55, 165],
      opacity:  [0.55, 0],
      duration: 3600,
      ease:     'outQuad',
      loop:     true,
      delay:    stagger(1200),
    } as AnimationParams));

    // 4. Service tiles bob up-and-down with staggered phase from the centre.
    animations.push(animate('.cl-tile-group', {
      translateY: [0, -5, 0],
      duration:   4500,
      ease:       'inOutSine',
      loop:       true,
      delay:      stagger(280, { from: 'center' }),
    } as AnimationParams));

    // 5. Data dots travel from the cloud to each tile.
    SERVICES.forEach((s, i) => {
      const dotEl = document.getElementById(`cl-dot-${s.id}`);
      if (!dotEl) return;

      const targetY = s.y - TILE_H / 2 - 4;
      const cpX     = CLOUD_CX + (s.x - CLOUD_CX) * 0.5;
      const cpY     = (CLOUD_BASE + targetY) / 2 - 30;

      // Sample the quadratic Bezier at three key points to give the dot a
      // gentle curved motion. Anime.js will tween between them.
      const midX = (CLOUD_CX + 2 * cpX + s.x) / 4;        // t=0.5 of quad bezier x
      const midY = (CLOUD_BASE + 2 * cpY + targetY) / 4;  // t=0.5 of quad bezier y

      animations.push(animate(dotEl, {
        cx: [
          { value: CLOUD_CX, duration: 0 },
          { value: midX,     duration: 800,  ease: 'inOutQuad' },
          { value: s.x,      duration: 800,  ease: 'inOutQuad' },
        ],
        cy: [
          { value: CLOUD_BASE, duration: 0 },
          { value: midY,       duration: 800, ease: 'inOutQuad' },
          { value: targetY,    duration: 800, ease: 'inOutQuad' },
        ],
        opacity: [
          { value: 0, duration: 0 },
          { value: 1, duration: 250 },
          { value: 1, duration: 1100 },
          { value: 0, duration: 250 },
        ],
        loop:  true,
        delay: i * 280 + 400,
      } as AnimationParams));
    });

    // ─── Cleanup: pause every animation on unmount ──────────────────────
    return () => {
      animations.forEach((a) => {
        try { a.pause(); } catch { /* noop */ }
      });
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto aspect-square w-full max-w-[480px]"
      aria-label="Visualización de servicios cloud Azure"
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="h-full w-full"
        role="img"
        aria-labelledby="cloud-visual-title"
      >
        <title id="cloud-visual-title">Plataforma cloud Azure con servicios conectados</title>

        <defs>
          <radialGradient id="haloGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"   stopColor="rgba(96, 165, 250, 0.55)"/>
            <stop offset="60%"  stopColor="rgba(96, 165, 250, 0.10)"/>
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0)"/>
          </radialGradient>

          <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#60a5fa"/>
            <stop offset="50%"  stopColor="#6366f1"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>

          <linearGradient id="cloudHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.4)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>

          <filter id="cloudShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
            <feOffset dy="4" result="offsetblur"/>
            <feFlood floodColor="#3b82f6" floodOpacity="0.35"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Per-service gradient definitions for tile icon backgrounds */}
          {SERVICES.map((s) => (
            <radialGradient key={`g-${s.id}`} id={`gradDot-${s.id}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="60%"  stopColor="#bfdbfe"/>
              <stop offset="100%" stopColor="rgba(96,165,250,0)"/>
            </radialGradient>
          ))}
        </defs>

        {/* ─── 1. Halo behind the cloud ─────────────────────────────── */}
        <circle
          className="cl-halo"
          cx={CLOUD_CX} cy={CLOUD_CY}
          r={130}
          fill="url(#haloGrad)"
        />

        {/* ─── 2. Radar rings ───────────────────────────────────────── */}
        {[0, 1, 2].map((i) => (
          <circle
            key={`radar-${i}`}
            className="cl-radar"
            cx={CLOUD_CX} cy={CLOUD_CY}
            r={55}
            fill="none"
            stroke="rgba(147, 197, 253, 0.6)"
            strokeWidth="1"
          />
        ))}

        {/* ─── 3. Cloud silhouette (made of overlapping shapes for a soft outline) ─── */}
        <g className="cl-cloud" filter="url(#cloudShadow)">
          {/* Bottom flat ellipse anchors the cloud silhouette */}
          <path
            d="
              M 165 175
              Q 138 175 132 158
              Q 120 145 138 130
              Q 134 105 165 100
              Q 175 78 205 80
              Q 220 60 250 70
              Q 275 60 295 80
              Q 325 78 335 105
              Q 358 110 350 138
              Q 358 158 332 168
              Q 325 178 305 175
              Z
            "
            fill="url(#cloudGrad)"
            stroke="rgba(147, 197, 253, 0.4)"
            strokeWidth="1.5"
          />
          {/* Subtle highlight at the top */}
          <path
            d="
              M 175 105
              Q 200 80 245 75
              Q 285 75 320 100
              L 320 110
              Q 280 88 245 88
              Q 205 88 175 115 Z
            "
            fill="url(#cloudHighlight)"
          />

          {/* Tiny inline service hints inside the cloud */}
          <g opacity="0.85">
            <circle cx="200" cy="135" r="10" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.45)"/>
            <circle cx="240" cy="120" r="11" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.45)"/>
            <circle cx="280" cy="135" r="10" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.45)"/>
            <circle cx="220" cy="155" r="9"  fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.45)"/>
            <circle cx="260" cy="155" r="9"  fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.45)"/>
          </g>
        </g>

        {/* Cloud label */}
        <text
          x={CLOUD_CX}
          y={CLOUD_CY + 75}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="10"
          fill="#94a3b8"
          letterSpacing="3"
        >
          AZURE · CLOUD PLATFORM
        </text>

        {/* ─── 4. Connectors from cloud to tiles ────────────────────── */}
        {SERVICES.map((s) => {
          const isActive = hovered === s.id;
          return (
            <path
              key={`conn-${s.id}`}
              d={connectorPath(s.x, s.y)}
              stroke={isActive ? 'rgba(255,255,255,0.7)' : 'rgba(96,165,250,0.25)'}
              strokeWidth={isActive ? 1.6 : 1}
              strokeDasharray={isActive ? '0' : '4 6'}
              fill="none"
              style={{ transition: 'stroke 0.25s ease, stroke-width 0.25s ease' }}
            />
          );
        })}

        {/* ─── 5. Data dots travelling along the connectors ─────────── */}
        {SERVICES.map((s) => (
          <circle
            key={`dot-${s.id}`}
            id={`cl-dot-${s.id}`}
            cx={CLOUD_CX}
            cy={CLOUD_BASE}
            r={4}
            fill={`url(#gradDot-${s.id})`}
            opacity={0}
          />
        ))}

        {/* ─── 6. Service tiles ────────────────────────────────────── */}
        {SERVICES.map((s) => {
          const isActive = hovered === s.id;
          return (
            <g
              key={s.id}
              className="cl-tile-group"
              transform={`translate(${s.x - TILE_W / 2} ${s.y - TILE_H / 2})`}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.id)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              role="button"
              aria-label={`${s.label}: ${s.short}`}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              {/* Glow when active */}
              {isActive && (
                <rect
                  x={-4} y={-4}
                  width={TILE_W + 8} height={TILE_H + 8}
                  rx={14}
                  fill={s.glow}
                  opacity={0.35}
                  filter="url(#cloudShadow)"
                />
              )}

              {/* Tile body */}
              <rect
                width={TILE_W} height={TILE_H}
                rx={12}
                fill="rgba(15, 23, 42, 0.85)"
                stroke={isActive ? 'rgba(96, 165, 250, 0.9)' : 'rgba(96, 165, 250, 0.3)'}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: 'stroke 0.25s ease, stroke-width 0.25s ease' }}
              />

              {/* Icon disk */}
              <foreignObject x={8} y={(TILE_H - 32) / 2} width={32} height={32}>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent} text-white`}
                  style={{ boxShadow: `0 6px 14px -4px ${s.glow}` }}
                >
                  <div className="h-4 w-4">{s.icon}</div>
                </div>
              </foreignObject>

              {/* Labels */}
              <text
                x={48}
                y={28}
                fontFamily="'Inter', system-ui, sans-serif"
                fontSize="12"
                fontWeight="600"
                fill="#f1f5f9"
              >
                {s.label}
              </text>
              <text
                x={48}
                y={44}
                fontFamily="'JetBrains Mono', monospace"
                fontSize="9"
                fill="#94a3b8"
              >
                {s.short}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover hint tooltip rendered in HTML so it can wrap nicely */}
      {hovered && (() => {
        const s = SERVICES.find((x) => x.id === hovered)!;
        return (
          <div
            className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 z-10 animate-fade-in"
          >
            <div className="glass-card rounded-xl px-3 py-2 text-center max-w-[220px]">
              <p className="text-xs font-semibold text-white">{s.label}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-400">{s.hint}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
