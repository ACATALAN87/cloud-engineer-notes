interface FooterProps {
  base?: string;
}

export default function Footer({ base = '/' }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-slate-800/60 overflow-hidden" style={{ backgroundColor: '#020617' }}>
      {/* Glow line on top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), rgba(168,85,247,0.5), transparent)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[11px] font-bold tracking-wider text-white"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)',
                  boxShadow: '0 4px 14px -4px rgba(59, 130, 246, 0.5)',
                }}
              >
                ACS
              </span>
              <div>
                <p className="font-semibold text-slate-100">Ángel Luis Catalán</p>
                <p className="text-sm text-slate-500">Senior Cloud Engineer · Madrid</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
              Diseño y automatizo plataformas cloud seguras, escalables y
              mantenibles para entornos enterprise.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Azure', 'Terraform', 'DevOps', 'Platform Engineering'].map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 font-mono text-xs text-slate-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
              Navigation
            </p>
            <ul className="space-y-2.5">
              <li><a href={`${base}`}          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group">
                <span className="h-px w-2 bg-slate-700 group-hover:w-4 group-hover:bg-blue-400 transition-all" />Home</a></li>
              <li><a href={`${base}about/`}    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group">
                <span className="h-px w-2 bg-slate-700 group-hover:w-4 group-hover:bg-blue-400 transition-all" />About</a></li>
              <li><a href={`${base}projects/`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group">
                <span className="h-px w-2 bg-slate-700 group-hover:w-4 group-hover:bg-blue-400 transition-all" />Projects</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/acatalan87"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
                  </svg>
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:acatalan87@outlook.com"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
                  </svg>
                  acatalan87@outlook.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/60 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} Ángel Luis Catalán · Personal technical portfolio
          </p>
          <p className="text-xs text-slate-600">
            Built with <span className="text-slate-400">Astro</span> · <span className="text-slate-400">React</span> · <span className="text-slate-400">Tailwind</span> · Deployed on GitHub Pages
          </p>
        </div>
      </div>
    </footer>
  );
}
