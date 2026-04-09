interface HeroProps {
  base?: string;
}

export default function Hero({ base = '/' }: HeroProps) {
  return (
    <section className="relative border-b border-slate-800 py-24 sm:py-32" style={{ backgroundColor: '#0a0f1e' }}>
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">

          {/* Status badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-800 px-3 py-1" style={{ backgroundColor: 'rgba(30,58,138,0.25)' }}>
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              Madrid, España · Open to senior cloud roles
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ángel Luis{' '}
            <span className="text-blue-400">Catalán</span>
          </h1>

          <p className="mt-4 text-base font-medium text-slate-300 sm:text-lg">
            Senior Cloud Engineer (Azure) · Terraform · DevOps · Enterprise Infrastructure
          </p>

          {/* Summary */}
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            Más de 10 años de experiencia en entornos enterprise, especializado en infraestructura
            Azure, automatización y platform engineering. Enfocado en construir soluciones
            escalables, seguras y resilientes, evolucionando hacia roles de Cloud Architecture.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`${base}about/`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Ver perfil completo
            </a>
            <a
              href={`${base}labs/`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            >
              Explorar Labs
            </a>
            <a
              href={`${base}blog/`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            >
              Ver artículos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
