import { useRef } from 'react';
import type { ProjectItem } from './ProjectsBento';

const STATUS_STYLES: Record<ProjectItem['status'], { label: string; dot: string }> = {
  live:          { label: 'Live',         dot: 'bg-emerald-400'  },
  'in-progress': { label: 'In progress',  dot: 'bg-amber-400'    },
  planned:       { label: 'Planned',      dot: 'bg-slate-400'    },
  archived:      { label: 'Archived',     dot: 'bg-slate-600'    },
};

interface Props {
  projects: ProjectItem[];
  base:     string;
}

function MiniCard({ p, idx }: { p: ProjectItem; idx: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const status = STATUS_STYLES[p.status];

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <a
      ref={ref}
      onMouseMove={onMove}
      href={p.href}
      className={`reveal reveal-delay-${idx + 1} group spotlight glass-card flex flex-col rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-500">
          {p.category.toUpperCase()}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
        {p.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-400 leading-relaxed">
        {p.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.stack.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 font-mono text-[10px] text-slate-400"
          >
            {s}
          </span>
        ))}
      </div>

      <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-blue-300 group-hover:gap-2 transition-all">
        Read more
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  );
}

export default function FeaturedProjectsTeaser({ projects, base }: Props) {
  if (projects.length === 0) return null;

  return (
    <section className="relative border-b border-slate-800/60 py-24" style={{ backgroundColor: '#040818' }}>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-12 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="eyebrow">Featured projects</span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Recent <span className="text-gradient-static">work</span>
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Una selección de proyectos en los que estoy trabajando o que he
              entregado recientemente.
            </p>
          </div>
          <a href={`${base}projects/`} className="btn-ghost">
            <span>All projects</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, idx) => (
            <MiniCard key={p.slug} p={p} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
