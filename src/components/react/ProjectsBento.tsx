import { useRef } from 'react';

export interface ProjectItem {
  slug:        string;
  title:       string;
  description: string;
  status:      'live' | 'in-progress' | 'archived' | 'planned';
  category:    'infrastructure' | 'automation' | 'platform' | 'web' | 'data' | 'other';
  featured:    boolean;
  stack:       string[];
  highlights:  string[];
  repoUrl?:    string;
  liveUrl?:    string;
  href:        string;   // detail page
  date:        string;   // formatted
}

const STATUS_STYLES: Record<ProjectItem['status'], { label: string; dot: string; chip: string }> = {
  live:          { label: 'Live',         dot: 'bg-emerald-400',  chip: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
  'in-progress': { label: 'In progress',  dot: 'bg-amber-400',    chip: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
  planned:       { label: 'Planned',      dot: 'bg-slate-400',    chip: 'border-slate-500/40 text-slate-300 bg-slate-500/10' },
  archived:      { label: 'Archived',     dot: 'bg-slate-600',    chip: 'border-slate-700/40 text-slate-400 bg-slate-700/10' },
};

const CATEGORY_ACCENTS: Record<ProjectItem['category'], { gradient: string; glow: string; icon: React.ReactNode }> = {
  infrastructure: {
    gradient: 'from-blue-400 to-cyan-400',
    glow:     'rgba(59, 130, 246, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <rect x="2" y="3" width="20" height="6" rx="1" />
        <rect x="2" y="15" width="20" height="6" rx="1" />
        <path d="M6 6h.01M6 18h.01" />
      </svg>
    ),
  },
  automation: {
    gradient: 'from-violet-400 to-fuchsia-400',
    glow:     'rgba(168, 85, 247, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    ),
  },
  platform: {
    gradient: 'from-cyan-400 to-teal-400',
    glow:     'rgba(34, 211, 238, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 2 2 7l10 5 10-5z" />
        <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  web: {
    gradient: 'from-emerald-400 to-cyan-400',
    glow:     'rgba(16, 185, 129, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  data: {
    gradient: 'from-amber-400 to-rose-400',
    glow:     'rgba(245, 158, 11, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        <path d="M3 12a9 3 0 0 0 18 0" />
      </svg>
    ),
  },
  other: {
    gradient: 'from-slate-400 to-slate-600',
    glow:     'rgba(148, 163, 184, 0.25)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
};

function ProjectCard({ p, idx, span = false }: { p: ProjectItem; idx: number; span?: boolean }) {
  const ref    = useRef<HTMLAnchorElement>(null);
  const status = STATUS_STYLES[p.status];
  const cat    = CATEGORY_ACCENTS[p.category];

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const delayClass = `reveal-delay-${Math.min(idx + 1, 6)}`;

  return (
    <a
      ref={ref}
      onMouseMove={onMove}
      href={p.href}
      className={`reveal ${delayClass} group spotlight glass-card relative flex flex-col overflow-hidden rounded-2xl p-7 ${
        span ? 'lg:col-span-2' : ''
      }`}
    >
      {/* Top: icon + status */}
      <div className="flex items-start justify-between">
        <div
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-white`}
          style={{ boxShadow: `0 8px 20px -6px ${cat.glow}` }}
        >
          {cat.icon}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.chip}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Title + description */}
      <div className="mt-6 flex-1">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 leading-snug transition-colors">
          {p.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {p.description}
        </p>

        {span && p.highlights.length > 0 && (
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {p.highlights.slice(0, 4).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-400" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stack chips */}
      {p.stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {p.stack.slice(0, span ? 8 : 5).map((s) => (
            <span
              key={s}
              className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 font-mono text-[11px] text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Bottom: links + arrow */}
      <div className="mt-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {p.repoUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
              </svg>
              Repo
            </span>
          )}
          {p.liveUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Live
            </span>
          )}
          <span className="font-mono text-xs text-slate-600">{p.date}</span>
        </div>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/60 text-slate-400 transition-all group-hover:border-blue-400/60 group-hover:text-blue-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  );
}

export default function ProjectsBento({ projects }: { projects: ProjectItem[] }) {
  if (projects.length === 0) {
    return (
      <div className="reveal glass-card mx-auto max-w-2xl rounded-2xl p-12 text-center">
        <p className="text-slate-300">No projects published yet — coming soon.</p>
      </div>
    );
  }

  // First (featured) takes full-width on lg; rest in 2-col grid
  const [first, ...rest] = projects;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ProjectCard p={first} idx={0} span={true} />
      {rest.map((p, idx) => (
        <ProjectCard key={p.slug} p={p} idx={idx + 1} />
      ))}
    </div>
  );
}
