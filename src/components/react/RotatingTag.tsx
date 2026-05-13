import { useState, useEffect, useRef } from 'react';

const TAGS = [
  'Infraestructura Azure',
  'Terraform e IaC',
  'DevOps y automatización',
  'Redes empresariales',
  'Operación cloud',
  'Arquitectura cloud',
] as const;

const INTERVAL_MS   = 2800;
const FADE_DURATION = 400; // ms — must match CSS transition duration

/**
 * RotatingTag
 *
 * Cycles through TAGS with a fade + subtle vertical motion.
 * Respects prefers-reduced-motion: if enabled, the first tag is shown
 * statically with no animation.
 *
 * Rendered as an inline-flex block below the main headline.
 */
export default function RotatingTag() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion.current) return;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % TAGS.length);
        setVisible(true);
      }, FADE_DURATION);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className="mt-3 inline-flex items-center gap-2 text-base sm:text-lg font-mono font-medium text-slate-400"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-blue-400 select-none">›</span>
      <span
        className="inline-block"
        style={{
          transition: reducedMotion.current
            ? 'none'
            : `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
          opacity:   visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(4px)',
          minWidth:  '14rem',
        }}
      >
        <span className="text-gradient-static">{TAGS[index]}</span>
        <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-blue-400 animate-blink-soft align-middle" />
      </span>
    </span>
  );
}
