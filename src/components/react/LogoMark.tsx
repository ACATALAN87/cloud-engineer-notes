/**
 * LogoMark — marca personal de Ángel Luis Catalán
 *
 * Diseño: iniciales "AC" en tipografía monoespaciada sobre fondo azul oscuro,
 * con dos nodos conectados por línea diagonal en la esquina superior derecha
 * como referencia sutil a estructuras técnicas (grafo, red, nodos).
 *
 * Props:
 *   size    — tamaño en px del viewBox cuadrado (default: 32)
 *   variant — "default" | "mono" (sin color de fondo, para uso sobre fondos claros)
 */

interface LogoMarkProps {
  size?:    number;
  variant?: 'default' | 'mono';
  className?: string;
}

export default function LogoMark({
  size    = 32,
  variant = 'default',
  className = '',
}: LogoMarkProps) {
  const bg      = variant === 'mono' ? 'transparent' : '#1d4ed8';   // blue-700
  const border  = variant === 'mono' ? 'none' : 'none';
  const textCol = '#ffffff';
  const nodeCol = variant === 'mono' ? '#3b82f6' : 'rgba(147,197,253,0.9)'; // blue-300/90
  const lineCol = variant === 'mono' ? '#3b82f6' : 'rgba(147,197,253,0.45)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AC — Ángel Luis Catalán"
      role="img"
      className={className}
    >
      {/* Background square with slightly rounded corners */}
      <rect
        x="0" y="0" width="32" height="32"
        rx="5"
        fill={bg}
      />

      {/* Subtle inner border for depth */}
      <rect
        x="0.5" y="0.5" width="31" height="31"
        rx="4.5"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />

      {/* Initials "AC" — JetBrains Mono style, tight tracking */}
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill={textCol}
        fontSize="12"
        fontWeight="700"
        fontFamily="'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
        letterSpacing="-0.5"
      >
        AC
      </text>

      {/* Geometric accent: two nodes + connecting line (top-right corner area) */}
      {/* Line connecting the two nodes */}
      <line
        x1="21.5" y1="4.5"
        x2="27.5" y2="10.5"
        stroke={lineCol}
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Node 1 — small, top-right */}
      <circle cx="27.5" cy="10.5" r="1.5" fill={nodeCol} />
      {/* Node 2 — slightly larger, closer to center */}
      <circle cx="21.5" cy="4.5"  r="1"   fill={nodeCol} opacity="0.7" />
    </svg>
  );
}
