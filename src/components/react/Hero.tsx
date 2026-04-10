import RotatingTag from './RotatingTag';

interface HeroProps {
  base?: string;
}

export default function Hero({ base = '/' }: HeroProps) {
  return (
    <section
      className="relative border-b border-slate-800 py-28 sm:py-36"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.7) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.7) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] opacity-[0.07]"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 20% 40%, #3b82f6 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">

          {/* Location badge */}
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-800/70 px-3.5 py-1.5"
            style={{ backgroundColor: 'rgba(30,58,138,0.2)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="font-mono text-xs text-blue-300 tracking-wide">
              Madrid, España
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Senior Cloud Engineer
            <RotatingTag />
          </h1>

          {/* Sub-headline */}
          <p className="mt-5 text-lg font-medium text-slate-300 leading-relaxed max-w-2xl">
            Diseño y automatizo plataformas cloud seguras, escalables y mantenibles
            para entornos enterprise.
          </p>

          {/* Supporting text */}
          <p className="mt-4 text-base leading-7 text-slate-400 max-w-2xl">
            Más de 10 años de experiencia en sistemas críticos. Especializado en
            infraestructura Azure, platform engineering, networking, CI/CD e
            Infrastructure as Code. Evolucionando hacia Cloud Architecture.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={`${base}about/`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Professional profile
            </a>
            {/* Technical labs button hidden — not enough content yet */}
            {/* <a
              href={`${base}labs/`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-blue-700 hover:text-blue-300 transition-colors"
            >
              Technical labs
            </a> */}
          </div>

          {/* Contact links */}
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500" aria-hidden="true">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
              </svg>
              LinkedIn
            </a>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <a
              href="mailto:acatalan87@outlook.com"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
              </svg>
              acatalan87@outlook.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
