import { useRef } from 'react';

interface SkillDomain {
  title:    string;
  label:    string;
  skills:   string[];
  accent:   string;     // tailwind gradient classes
  heading:  string;     // tailwind text color
  chip:     string;     // tailwind classes for chips
  glow:     string;     // glow color
  icon:     React.ReactNode;
}

const domains: SkillDomain[] = [
  {
    title:   'Cloud & Platform',
    label:   '01',
    skills:  ['Azure', 'Azure Networking', 'Enterprise Infrastructure', 'Platform Engineering', 'Monitoring & Observability', 'RBAC & Governance'],
    accent:  'from-blue-400 to-cyan-400',
    heading: 'text-blue-300',
    chip:    'border-blue-500/30 text-blue-200 hover:border-blue-400/60 hover:bg-blue-500/10',
    glow:    'rgba(59, 130, 246, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6.5 6.5 0 0 0 4 12.5a5.5 5.5 0 0 0 5.5 5.5z" />
      </svg>
    ),
  },
  {
    title:   'DevOps & Automation',
    label:   '02',
    skills:  ['Terraform', 'Azure DevOps', 'GitHub Actions', 'CI/CD Pipelines', 'Bash / Shell', 'Infrastructure as Code'],
    accent:  'from-violet-400 to-fuchsia-400',
    heading: 'text-violet-300',
    chip:    'border-violet-500/30 text-violet-200 hover:border-violet-400/60 hover:bg-violet-500/10',
    glow:    'rgba(168, 85, 247, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 4.21 16.96l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.29l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    title:   'Data & Enterprise Platforms',
    label:   '03',
    skills:  ['Snowflake', 'Couchbase Capella', 'Azure Data Factory', 'SQL', 'Appian', 'Platform Configuration'],
    accent:  'from-cyan-400 to-emerald-400',
    heading: 'text-cyan-300',
    chip:    'border-cyan-500/30 text-cyan-200 hover:border-cyan-400/60 hover:bg-cyan-500/10',
    glow:    'rgba(34, 211, 238, 0.3)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        <path d="M3 12a9 3 0 0 0 18 0" />
      </svg>
    ),
  },
];

function DomainCard({ domain, idx }: { domain: SkillDomain; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`reveal reveal-delay-${idx + 1} spotlight glass-card relative overflow-hidden rounded-2xl p-6`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${domain.accent} text-white`}
          style={{ boxShadow: `0 8px 20px -6px ${domain.glow}` }}
        >
          {domain.icon}
        </div>
        <div className="flex-1">
          <span className="font-mono text-xs text-slate-500">{domain.label}</span>
          <h3 className={`text-sm font-semibold ${domain.heading}`}>
            {domain.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {domain.skills.map((skill) => (
          <span
            key={skill}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-default ${domain.chip}`}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SkillGrid() {
  return (
    <section className="relative border-b border-slate-800/60 py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-12 max-w-2xl">
          <span className="eyebrow">Core skills</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Technical <span className="text-gradient-static">stack</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Habilidades agrupadas por dominio. Foco en Azure, automatización e
            infraestructura enterprise.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, idx) => (
            <DomainCard key={d.title} domain={d} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
