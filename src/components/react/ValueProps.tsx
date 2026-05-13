import { useRef } from 'react';

interface Prop {
  number:  string;
  title:   string;
  body:    string;
  accent:  string;
  glow:    string;
  icon:    React.ReactNode;
}

const props: Prop[] = [
  {
    number: '01',
    title:  'Enterprise Azure Infrastructure',
    body:   'Design and deployment of Azure infrastructure for enterprise environments with focus on scalability, security and maintainability. VNets, NSGs, firewalls, VPN gateways, ExpressRoute and beyond.',
    accent: 'from-blue-400 to-cyan-400',
    glow:   'rgba(59, 130, 246, 0.25)',
    icon:   (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M2 22h20" />
        <path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
        <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" />
      </svg>
    ),
  },
  {
    number: '02',
    title:  'IaC & Standardization',
    body:   'Full platform automation using Terraform, GitHub Actions and Azure DevOps. Reusable modules, remote state, consistent environments and reduced operational friction across the board.',
    accent: 'from-violet-400 to-fuchsia-400',
    glow:   'rgba(168, 85, 247, 0.25)',
    icon:   (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
      </svg>
    ),
  },
  {
    number: '03',
    title:  'Reliability & Operations',
    body:   'Real-world experience in 24x7 critical systems, complex platform integration, incident troubleshooting and operational discipline built over 10+ years in enterprise environments.',
    accent: 'from-cyan-400 to-emerald-400',
    glow:   'rgba(34, 211, 238, 0.25)',
    icon:   (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

function ValueCard({ p, idx }: { p: Prop; idx: number }) {
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
      className={`reveal reveal-delay-${idx + 1} spotlight glass-card relative overflow-hidden rounded-2xl p-7`}
    >
      {/* Number watermark */}
      <span
        className={`absolute -right-2 -top-4 font-mono text-7xl font-bold bg-gradient-to-br ${p.accent} bg-clip-text text-transparent opacity-10 select-none`}
        aria-hidden="true"
      >
        {p.number}
      </span>

      {/* Icon */}
      <div
        className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.accent} text-white`}
        style={{ boxShadow: `0 10px 25px -5px ${p.glow}` }}
      >
        {p.icon}
      </div>

      <div className="flex items-center gap-2">
        <span className={`font-mono text-xs font-bold bg-gradient-to-r ${p.accent} bg-clip-text text-transparent`}>
          {p.number}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
      </div>

      <h3 className="mt-3 text-base font-semibold text-white leading-snug">
        {p.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {p.body}
      </p>
    </div>
  );
}

export default function ValueProps() {
  return (
    <section className="relative border-b border-slate-800/60 py-24" style={{ backgroundColor: '#040818' }}>
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(96,165,250,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(96,165,250,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-12 max-w-2xl">
          <span className="eyebrow">What I bring</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            How I <span className="text-gradient-static">work</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Tres pilares que definen mi enfoque profesional en ingeniería cloud.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p, idx) => (
            <ValueCard key={p.title} p={p} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
