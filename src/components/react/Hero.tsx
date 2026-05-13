import RotatingTag from './RotatingTag';
import AnimatedBackground from './AnimatedBackground';

interface HeroProps {
  base?: string;
}

export default function Hero({ base = '/' }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-slate-800/60 py-28 sm:py-36"
      style={{ backgroundColor: '#050914' }}
    >
      {/* Layer 1: Animated particle network */}
      <AnimatedBackground density={16000} linkDistance={130} />

      {/* Layer 2: Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(96,165,250,0.7) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(96,165,250,0.7) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
        }}
      />

      {/* Layer 3: Animated radial blobs */}
      <div
        className="pointer-events-none absolute -left-32 top-10 h-[480px] w-[480px] rounded-full opacity-30 animate-blob"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full opacity-25 animate-blob"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '-6s',
        }}
      />

      {/* Bottom fade to next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to bottom, transparent, #020617)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">

          {/* Status badge */}
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 px-3.5 py-1.5 backdrop-blur-sm animate-fade-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(30,58,138,0.35), rgba(76,29,149,0.25))',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            <span className="font-mono text-xs font-medium text-blue-200 tracking-wide">
              Madrid, España · Abierto a oportunidades cloud
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="block">Ingeniero</span>
            <span className="block text-gradient">Cloud Senior</span>
            <RotatingTag />
          </h1>

          {/* Sub-headline */}
          <p
            className="mt-6 text-lg font-medium text-slate-300 leading-relaxed max-w-2xl animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Diseño y automatizo plataformas cloud{' '}
            <span className="text-white font-semibold">seguras, escalables y mantenibles</span>{' '}
            para entornos enterprise.
          </p>

          {/* Supporting text */}
          <p
            className="mt-4 text-base leading-7 text-slate-400 max-w-2xl animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            Más de 10 años de experiencia en sistemas críticos. Especializado en
            infraestructura Azure, platform engineering, networking, CI/CD e
            Infrastructure as Code. Evolucionando hacia arquitectura cloud.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-wrap items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <a href={`${base}about/`} className="btn-primary">
              <span>Perfil profesional</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a href={`${base}projects/`} className="btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-400" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Ver proyectos</span>
            </a>
          </div>

          {/* Contact links */}
          <div
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-blue-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="https://github.com/acatalan87"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
              </svg>
              GitHub
            </a>
            <a
              href="mailto:acatalan87@outlook.com"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
              </svg>
              acatalan87@outlook.com
            </a>
          </div>

          {/* Quick stats — small inline row */}
          <div
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-slate-800/60 pt-8 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gradient-static">10+</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Años</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gradient-static">7</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Certificaciones</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gradient-static">24×7</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Operación crítica</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
