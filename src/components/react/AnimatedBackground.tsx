import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  /** density: smaller = more particles. Default 14000 (1 particle per ~14000 px²) */
  density?: number;
  /** max distance to draw connection lines between particles */
  linkDistance?: number;
  /** color of particles & lines (RGB triplet, no alpha) */
  color?: string;
  className?: string;
}

/**
 * AnimatedBackground
 *
 * Lightweight canvas with floating particles connected by faint lines.
 * Reacts to the mouse: particles within a radius are pulled slightly toward
 * the cursor. Pauses when the document is hidden. Honours reduced-motion.
 *
 * Rendered as absolute positioned canvas — parent must be `relative`.
 */
export default function AnimatedBackground({
  density       = 14000,
  linkDistance  = 130,
  color         = '96, 165, 250',
  className     = '',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // Static dot pattern fallback would still pollute. Just leave canvas empty.
      return;
    }

    let width  = 0;
    let height = 0;
    let dpr    = Math.min(window.devicePixelRatio || 1, 2);
    let raf    = 0;
    let particles: { x: number; y: number; vx: number; vy: number }[] = [];

    const mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width  = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(width  * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // (Re)generate particle field proportional to area
      const target = Math.max(20, Math.floor((width * height) / density));
      particles = new Array(target).fill(0).map(() => ({
        x:  Math.random() * width,
        y:  Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Move + draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0)      { p.x = 0;      p.vx *= -1; }
        if (p.x > width)  { p.x = width;  p.vx *= -1; }
        if (p.y < 0)      { p.y = 0;      p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Slight attraction to mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 160 * 160 && d2 > 1) {
            const f = 0.0008;
            p.vx += dx * f;
            p.vy += dy * f;
          }
        }

        // Friction
        p.vx *= 0.985;
        p.vy *= 0.985;
        // Keep a minimum drift so they don't freeze
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.06;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.06;

        ctx.fillStyle = `rgba(${color}, 0.55)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw links between near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDistance * linkDistance) {
            const alpha = (1 - Math.sqrt(d2) / linkDistance) * 0.25;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Halo around mouse
      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
        grd.addColorStop(0,   `rgba(${color}, 0.18)`);
        grd.addColorStop(1,   `rgba(${color}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    raf = requestAnimationFrame(tick);

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, linkDistance, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-auto absolute inset-0 ${className}`}
    />
  );
}
