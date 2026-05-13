import { useState, useEffect } from 'react';
import { useScrollReveal } from './useScrollReveal';

interface HeaderProps {
  base?: string;
}

export default function Header({ base = '/' }: HeaderProps) {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active,   setActive]   = useState<string>('');

  // Initialize the global scroll-reveal observer once
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setActive(window.location.pathname);
  }, []);

  const nav = [
    { label: 'Home',     href: `${base}` },
    { label: 'About',    href: `${base}about/` },
    { label: 'Projects', href: `${base}projects/` },
  ];

  const isActive = (href: string) => {
    const a = active.replace(/\/$/, '');
    const h = href.replace(/\/$/, '');
    return a === h;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-800/80 backdrop-blur-xl'
          : 'border-b border-transparent backdrop-blur-md'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(2, 6, 23, 0.85)' : 'rgba(2, 6, 23, 0.55)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <a href={`${base}`} className="group flex items-center gap-3">
            <span
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg font-mono text-[11px] font-bold text-white select-none"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)',
                boxShadow: '0 4px 14px -4px rgba(59, 130, 246, 0.5)',
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                }}
              />
              <span className="relative z-10 tracking-wider">ACS</span>
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-100 group-hover:text-white leading-none transition-colors">
                Ángel Luis Catalán
              </p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                Senior Cloud Engineer
              </p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {nav.map((item) => {
              const activeItem = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                    activeItem
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeItem && (
                    <span
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                      aria-hidden="true"
                      style={{
                        background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                        boxShadow: '0 0 10px rgba(96, 165, 250, 0.6)',
                      }}
                    />
                  )}
                </a>
              );
            })}
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-200 hover:border-blue-400/60 hover:bg-blue-500/20 hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
              </svg>
              LinkedIn
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-md p-2 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="border-t border-slate-800/60 pb-4 pt-3 flex flex-col gap-1" aria-label="Mobile menu">
            {nav.map((item) => {
              const activeItem = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${
                    activeItem
                      ? 'bg-blue-500/10 text-blue-200 border border-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="https://www.linkedin.com/in/angel-luis-catal%C3%A1n-s%C3%A1nchez-35a68352/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2.5 text-sm text-blue-200 hover:border-blue-400/60 hover:bg-blue-500/20 hover:text-white transition-colors"
            >
              LinkedIn ↗
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
