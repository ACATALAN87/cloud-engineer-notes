import { useEffect, useRef, useState } from 'react';
import { animate, stagger, type AnimationParams } from 'animejs';

/**
 * CloudVisual — "AI Cloud Console"
 *
 * Hero-side visualisation that combines three storytelling layers:
 *
 *   1. A stylised cloud silhouette that doubles as a neural network
 *      (cloud + brain), with synapse lines pulsing and node activations
 *      orchestrated by anime.js.
 *
 *   2. A console / terminal panel that types live messages from a rotating
 *      queue covering cloud, AI, DevOps and security topics. Each message
 *      is typewriter-animated, paused briefly, then replaced.
 *
 *   3. A row of floating concept chips bobbing with a staggered phase.
 *
 * All animations honour `prefers-reduced-motion` and clean up on unmount.
 */

interface Message {
  /** Single-glyph "kind" prefix (looks like a shell prompt) */
  prefix:  string;
  /** Hex color for the prefix glyph */
  color:   string;
  /** Sentence body — typed character by character */
  text:    string;
  /** Tag shown at the right of the line */
  tag:     string;
}

const MESSAGES: Message[] = [
  { prefix: '$',  color: '#60a5fa', text: 'terraform apply alz-prod ...',          tag: 'IaC' },
  { prefix: '✓',  color: '#34d399', text: 'AKS cluster scaled 8 → 16 nodes',       tag: 'Kubernetes' },
  { prefix: '↻',  color: '#a78bfa', text: 'Azure OpenAI endpoint warming up',      tag: 'AI' },
  { prefix: '⚡', color: '#fbbf24', text: 'AI cost agent: −23% monthly spend',      tag: 'FinOps' },
  { prefix: '◉',  color: '#22d3ee', text: 'VNet peering hub ↔ spoke-prod',         tag: 'Network' },
  { prefix: '✦',  color: '#f472b6', text: 'OIDC token issued · zero secrets',      tag: 'CI/CD' },
  { prefix: '⌬', color: '#c084fc', text: 'Training Azure ML model v2.3',           tag: 'ML' },
  { prefix: '⌖', color: '#fb7185', text: 'Defender alert auto-mitigated',          tag: 'Security' },
  { prefix: '◈',  color: '#34d399', text: 'Sentinel: 0 incidents · 24h healthy',   tag: 'SIEM' },
  { prefix: '⌘', color: '#60a5fa', text: 'Copilot deployed across 14 repos',      tag: 'DevEx' },
];

const CONCEPT_TAGS = [
  'Azure',
  'OpenAI',
  'Terraform',
  'Kubernetes',
  'OIDC',
  'Sentinel',
];

const TYPE_SPEED_MS    = 32;     // ms per character
const PAUSE_AFTER_TYPE = 1700;   // pause before next message
const PAUSE_BETWEEN    = 250;    // gap between erase + new type

/* ────────────────────────────────────────────────────────────────────────
   Neural-cloud SVG sub-component
   ──────────────────────────────────────────────────────────────────────── */

const NEURAL_NODES: { x: number; y: number; r: number }[] = [
  { x: 240, y: 88,  r: 5 },   // top centre
  { x: 200, y: 108, r: 4 },   // left
  { x: 280, y: 108, r: 4 },   // right
  { x: 220, y: 132, r: 5 },   // bottom-left
  { x: 260, y: 132, r: 5 },   // bottom-right
  { x: 240, y: 112, r: 6 },   // centre (slightly bigger — "central neuron")
];

/** Synapse lines connecting neighbouring nodes — drawn behind the nodes. */
const NEURAL_LINES: [number, number][] = [
  [0, 1], [0, 2], [0, 5],
  [1, 5], [2, 5],
  [1, 3], [2, 4],
  [3, 5], [4, 5],
  [3, 4],
];

function NeuralCloud() {
  return (
    <svg
      viewBox="0 0 480 220"
      className="absolute inset-x-0 top-0 w-full"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="nc-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"   stopColor="rgba(96, 165, 250, 0.55)" />
          <stop offset="60%"  stopColor="rgba(96, 165, 250, 0.10)" />
          <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
        </radialGradient>
        <linearGradient id="nc-cloud" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#60a5fa" />
          <stop offset="50%"  stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="nc-highlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="nc-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dy="4" result="o" />
          <feFlood floodColor="#3b82f6" floodOpacity="0.35" />
          <feComposite in2="o" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Halo */}
      <circle className="nc-halo" cx="240" cy="110" r="130" fill="url(#nc-halo)" />

      {/* Radar rings */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="nc-radar"
          cx="240" cy="110" r="50"
          fill="none"
          stroke="rgba(147, 197, 253, 0.6)"
          strokeWidth="1"
        />
      ))}

      {/* Cloud silhouette + brain inside */}
      <g
        className="nc-cloud"
        filter="url(#nc-shadow)"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        {/* Outer cloud shape */}
        <path
          d="
            M 165,155
            Q 138,155 132,138
            Q 120,125 138,110
            Q 134,85 165,80
            Q 175,58 205,60
            Q 220,40 250,50
            Q 275,40 295,60
            Q 325,58 335,85
            Q 358,90 350,118
            Q 358,138 332,148
            Q 325,158 305,155
            Z
          "
          fill="url(#nc-cloud)"
          stroke="rgba(147, 197, 253, 0.4)"
          strokeWidth="1.5"
        />
        {/* Light highlight at the top */}
        <path
          d="
            M 175,85
            Q 200,60 245,55
            Q 285,55 320,80
            L 320,90
            Q 280,68 245,68
            Q 205,68 175,95 Z
          "
          fill="url(#nc-highlight)"
        />

        {/* Synapse lines (drawn first, behind nodes) */}
        <g className="nc-synapses">
          {NEURAL_LINES.map(([a, b], idx) => {
            const A = NEURAL_NODES[a];
            const B = NEURAL_NODES[b];
            return (
              <line
                key={idx}
                className="nc-synapse"
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.7"
              />
            );
          })}
        </g>

        {/* Neural nodes */}
        <g className="nc-nodes">
          {NEURAL_NODES.map((n, idx) => (
            <g key={idx}>
              <circle
                className="nc-node-glow"
                cx={n.x} cy={n.y} r={n.r * 2.5}
                fill="rgba(147, 197, 253, 0.55)"
              />
              <circle
                className="nc-node"
                cx={n.x} cy={n.y} r={n.r}
                fill="#ffffff"
                stroke="rgba(15,23,42,0.4)"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </g>
      </g>

      {/* Label below cloud */}
      <text
        x="240" y="200"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="9"
        fill="#94a3b8"
        letterSpacing="3"
      >
        AI · CLOUD · PLATFORM
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Console with typewriter
   ──────────────────────────────────────────────────────────────────────── */

function useTypewriter() {
  const [index,     setIndex]     = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase,     setPhase]     = useState<'typing' | 'paused' | 'erasing'>('typing');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // With reduced motion, just cycle the message every few seconds with no typing.
    if (reduce) {
      setDisplayed(MESSAGES[index].text);
      const t = setTimeout(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
      return () => clearTimeout(t);
    }

    const msg = MESSAGES[index].text;
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (displayed.length < msg.length) {
        timer = setTimeout(() => {
          setDisplayed(msg.slice(0, displayed.length + 1));
        }, TYPE_SPEED_MS);
      } else {
        timer = setTimeout(() => setPhase('paused'), PAUSE_AFTER_TYPE);
      }
    } else if (phase === 'paused') {
      timer = setTimeout(() => setPhase('erasing'), 0);
    } else {
      // erasing
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), TYPE_SPEED_MS / 2);
      } else {
        timer = setTimeout(() => {
          setIndex((i) => (i + 1) % MESSAGES.length);
          setPhase('typing');
        }, PAUSE_BETWEEN);
      }
    }

    return () => clearTimeout(timer);
  }, [displayed, phase, index]);

  return { message: MESSAGES[index], displayed };
}

function Console() {
  const { message, displayed } = useTypewriter();

  return (
    <div className="absolute inset-x-0 top-[44%]">
      <div className="mx-auto w-[88%] max-w-[420px]">
        <div className="glass-card relative overflow-hidden rounded-xl">
          {/* Window header */}
          <div className="flex items-center gap-1.5 border-b border-slate-700/40 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500/60" />
            <span className="h-2 w-2 rounded-full bg-amber-500/60" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
            <span className="ml-2 font-mono text-[9px] text-slate-500">
              ai-cloud · live
            </span>
            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              connected
            </span>
          </div>

          {/* Terminal body */}
          <div className="px-4 py-3 font-mono text-[12px] leading-snug">
            <div className="flex items-baseline gap-2">
              <span
                className="text-[15px] font-bold leading-none"
                style={{ color: message.color }}
              >
                {message.prefix}
              </span>
              <span className="flex-1 truncate text-slate-200">
                {displayed}
                <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-blue-400 align-middle animate-blink-soft" />
              </span>
              <span
                className="flex-shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  borderColor: `${message.color}55`,
                  color: message.color,
                  backgroundColor: `${message.color}11`,
                }}
              >
                {message.tag}
              </span>
            </div>

            {/* Idle line below — subtle */}
            <div className="mt-1 flex items-center gap-2 opacity-50">
              <span className="text-slate-500">›</span>
              <span className="text-slate-500 text-[10px]">
                tail -f /var/log/cloud.log
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────────────── */

export default function CloudVisual() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const animations: ReturnType<typeof animate>[] = [];

    // 1. Cloud breathing — gentle scale around its centre.
    animations.push(animate('.nc-cloud', {
      scale:    [1, 1.025, 1],
      duration: 4500,
      ease:     'inOutSine',
      loop:     true,
    } as AnimationParams));

    // 2. Halo intensity pulse.
    animations.push(animate('.nc-halo', {
      opacity:   [0.35, 0.7],
      duration:  2800,
      ease:      'inOutSine',
      loop:      true,
      alternate: true,
    } as AnimationParams));

    // 3. Radar rings — staggered emanation from the cloud centre.
    animations.push(animate('.nc-radar', {
      r:        [50, 160],
      opacity:  [0.55, 0],
      duration: 3600,
      ease:     'outQuad',
      loop:     true,
      delay:    stagger(1200),
    } as AnimationParams));

    // 4. Neural nodes — irregular firing with stagger.
    animations.push(animate('.nc-node', {
      opacity:  [1, 0.35, 1],
      duration: 1800,
      ease:     'inOutSine',
      loop:     true,
      delay:    stagger(220, { from: 'random' }),
    } as AnimationParams));

    // 5. Neural-node glow halos — slower and overlap with node firing.
    animations.push(animate('.nc-node-glow', {
      opacity:  [0.35, 0.85, 0.35],
      scale:    [1, 1.4, 1],
      duration: 2400,
      ease:     'inOutSine',
      loop:     true,
      delay:    stagger(180, { from: 'random' }),
    } as AnimationParams));

    // 6. Synapse lines — fade in/out at different rhythms.
    animations.push(animate('.nc-synapse', {
      opacity:  [0.15, 0.75, 0.15],
      duration: 2200,
      ease:     'inOutSine',
      loop:     true,
      delay:    stagger(140, { from: 'random' }),
    } as AnimationParams));

    // 7. Concept chips floating.
    animations.push(animate('.cl-chip', {
      translateY: [0, -4, 0],
      duration:   4200,
      ease:       'inOutSine',
      loop:       true,
      delay:      stagger(280, { from: 'center' }),
    } as AnimationParams));

    return () => {
      animations.forEach((a) => {
        try { a.pause(); } catch { /* noop */ }
      });
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto w-full max-w-[480px] aspect-square"
      aria-label="Visualización AI Cloud con consola en vivo"
    >
      {/* Layer 1 — Neural cloud */}
      <NeuralCloud />

      {/* Layer 2 — Console */}
      <Console />

      {/* Layer 3 — Concept chips */}
      <div className="absolute inset-x-0 bottom-2">
        <div className="mx-auto flex w-[88%] max-w-[420px] flex-wrap items-center justify-center gap-2">
          {CONCEPT_TAGS.map((tag, i) => (
            <span
              key={tag}
              className="cl-chip inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-blue-200 backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{
                  backgroundColor: ['#60a5fa', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'][i % 6],
                }}
              />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
