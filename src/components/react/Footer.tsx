interface FooterProps {
  base?: string;
}

export default function Footer({ base = '/' }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-800" style={{ backgroundColor: '#020617' }}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">

          {/* Brand */}
          <div>
            <p className="font-semibold text-slate-200">Ángel Luis Catalán</p>
            <p className="mt-1 text-sm text-slate-500">Senior Cloud Engineer</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Azure · Terraform · DevOps · Enterprise Infrastructure
            </p>
            <p className="mt-3 text-xs text-slate-700">
              Built with Astro · Tailwind CSS · GitHub Pages
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Navigation
            </p>
            <ul className="space-y-2">
              <li><a href={`${base}`} className="text-sm text-slate-400 hover:text-white transition-colors">Home</a></li>
              <li><a href={`${base}about/`} className="text-sm text-slate-400 hover:text-white transition-colors">About</a></li>
              <li><a href={`${base}labs/`} className="text-sm text-slate-400 hover:text-white transition-colors">Labs</a></li>
              <li><a href={`${base}blog/`} className="text-sm text-slate-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Contact
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a
                  href="mailto:acatalan87@outlook.com"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  acatalan87@outlook.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-slate-600">
            © {year} Ángel Luis Catalán · Personal technical portfolio
          </p>
          <p className="text-xs text-slate-700">Madrid, Spain</p>
        </div>
      </div>
    </footer>
  );
}
