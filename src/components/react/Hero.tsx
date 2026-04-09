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
            <span className="block mt-1 text-blue-400">Azure · Terraform · DevOps</span>
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
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`${base}about/`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Professional profile
            </a>
            <a
              href={`${base}labs/`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-blue-700 hover:text-blue-300 transition-colors"
            >
              Technical labs
            </a>
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
