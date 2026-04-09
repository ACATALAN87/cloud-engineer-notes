const props = [
  {
    number: '01',
    title:  'Enterprise Azure Infrastructure',
    body:   'Design and deployment of Azure infrastructure for enterprise environments with focus on scalability, security and maintainability. VNets, NSGs, firewalls, VPN gateways, ExpressRoute and beyond.',
    accent: 'text-blue-400',
    border: 'border-blue-800/50',
  },
  {
    number: '02',
    title:  'IaC & Standardization',
    body:   'Full platform automation using Terraform, GitHub Actions and Azure DevOps. Reusable modules, remote state, consistent environments and reduced operational friction across the board.',
    accent: 'text-violet-400',
    border: 'border-violet-800/50',
  },
  {
    number: '03',
    title:  'Reliability & Operations',
    body:   'Real-world experience in 24x7 critical systems, complex platform integration, incident troubleshooting and operational discipline built over 10+ years in enterprise environments.',
    accent: 'text-slate-300',
    border: 'border-slate-700/50',
  },
];

export default function ValueProps() {
  return (
    <section className="border-b border-slate-800 py-20" style={{ backgroundColor: '#080d1a' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          What I bring
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          How I work
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {props.map((p) => (
            <div
              key={p.title}
              className={`rounded-xl border p-7 ${p.border}`}
              style={{ backgroundColor: '#0d1424' }}
            >
              <span className={`font-mono text-xs font-bold ${p.accent}`}>{p.number}</span>
              <h3 className="mt-3 text-base font-semibold text-white leading-snug">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
