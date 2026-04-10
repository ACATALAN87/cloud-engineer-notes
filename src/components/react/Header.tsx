import { useState } from 'react';

interface HeaderProps {
  base?: string;
}

export default function Header({ base = '/' }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const nav = [
    { label: 'Home',  href: `${base}` },
    { label: 'About', href: `${base}about/` },
    // { label: 'Labs',  href: `${base}labs/` },   // hidden — not enough content yet
    // { label: 'Blog',  href: `${base}blog/` },   // hidden — not enough content yet
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 backdrop-blur-sm" style={{ backgroundColor: 'rgba(2,6,23,0.92)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <a href={`${base}`} className="group flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-mono text-sm font-bold text-white select-none">
              AL
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-200 group-hover:text-white leading-none transition-colors">
                Ángel Luis Catalán
              </p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                Senior Cloud Engineer
              </p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 rounded border border-blue-700 px-3 py-1.5 text-sm text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
            >
              LinkedIn ↗
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Open menu"
            aria-expanded={open}
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="border-t border-slate-800 pb-4 pt-2 md:hidden flex flex-col gap-0.5" aria-label="Mobile menu">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block rounded border border-blue-800 px-3 py-2.5 text-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
            >
              LinkedIn ↗
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
