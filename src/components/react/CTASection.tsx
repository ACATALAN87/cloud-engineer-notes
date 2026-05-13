export default function CTASection() {
  return (
    <section className="relative py-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal gradient-border relative overflow-hidden rounded-3xl px-8 py-16 sm:px-14 sm:py-20">
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.18), transparent 60%)',
            }}
          />

          {/* Floating accent blobs */}
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-30 animate-blob"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <div
            className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full opacity-30 animate-blob"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.45), transparent 70%)',
              filter: 'blur(30px)',
              animationDelay: '-9s',
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Contacto</span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Vamos a <span className="text-gradient">hablar</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-slate-300 leading-relaxed">
              Abierto a conversaciones profesionales sobre Azure, Terraform, DevOps
              y platform engineering. Escríbeme.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                </svg>
                <span>Conectar en LinkedIn</span>
              </a>
              <a
                href="mailto:acatalan87@outlook.com"
                className="btn-ghost w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-400" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
                </svg>
                <span>acatalan87@outlook.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
