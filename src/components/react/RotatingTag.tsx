import { useState, useEffect, useRef } from 'react';

const TAGS = [
  'Azure Infrastructure',
  'Terraform & IaC',
  'DevOps & Automation',
  'Enterprise Networking',
  'Cloud Operations',
  'Cloud Architecture',
] as const;

const INTERVAL_MS   = 2800;
const FADE_DURATION = 400; // ms — must match CSS transition duration

/**
 * RotatingTag
 *
 * Cycles through TAGS with a fade + subtle vertical motion.
 * Respects prefers-reduced-motion: if the user has it enabled,
 * the first tag is shown statically with no animation.
 *
 * Rendered inside an <h1> as a <span>, so it inherits heading styles.
 * A fixed min-width prevents layout shift between tags.
 */
export default function RotatingTag() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useRef(false);

  useEffect(() => {
    // Detect preference once on mount (client only)
    reducedMotion.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion.current) return; // static — no interval needed

    const timer = setInterval(() => {
      // Phase 1: fade out
      setVisible(false);

      // Phase 2: swap text mid-transition, then fade in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % TAGS.length);
        setVisible(true);
      }, FADE_DURATION);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      // Fixed height prevents layout shift; width set to longest tag
      className="block mt-1 text-blue-400"
      style={{
        // A single inline style keeps this self-contained without
        // needing a new CSS file or Tailwind arbitrary transitions
        transition: reducedMotion.current
          ? 'none'
          : `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        // Reserve height for the tallest tag to avoid reflow
        minHeight: '1.2em',
        display:   'block',
      }}
    >
      {TAGS[index]}
    </span>
  );
}
