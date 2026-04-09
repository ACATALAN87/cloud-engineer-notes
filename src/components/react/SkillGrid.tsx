interface SkillDomain {
  title:    string;
  label:    string;
  skills:   string[];
  border:   string;
  heading:  string;
  chip:     { border: string; text: string; bg: string };
}

const domains: SkillDomain[] = [
  {
    title:   'Cloud & Platform',
    label:   '01',
    skills:  ['Azure', 'Azure Networking', 'Enterprise Infrastructure', 'Platform Engineering', 'Monitoring & Observability', 'RBAC & Governance'],
    border:  'border-blue-800/60',
    heading: 'text-blue-400',
    chip:    { border: 'border-blue-800/70', text: 'text-blue-300', bg: 'rgba(30,58,138,0.18)' },
  },
  {
    title:   'DevOps & Automation',
    label:   '02',
    skills:  ['Terraform', 'Azure DevOps', 'GitHub Actions', 'CI/CD Pipelines', 'Bash / Shell', 'Infrastructure as Code'],
    border:  'border-violet-800/60',
    heading: 'text-violet-400',
    chip:    { border: 'border-violet-800/70', text: 'text-violet-300', bg: 'rgba(76,29,149,0.18)' },
  },
  {
    title:   'Data & Enterprise Platforms',
    label:   '03',
    skills:  ['Snowflake', 'Couchbase Capella', 'Azure Data Factory', 'SQL', 'Appian', 'Platform Configuration'],
    border:  'border-cyan-800/60',
    heading: 'text-cyan-400',
    chip:    { border: 'border-cyan-800/70', text: 'text-cyan-300', bg: 'rgba(21,94,117,0.18)' },
  },
];

export default function SkillGrid() {
  return (
    <section className="border-b border-slate-800 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Core Skills
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Technical stack
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Skills grouped by domain. Focused on Azure, automation and enterprise infrastructure.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <div
              key={domain.title}
              className={`rounded-xl border p-6 ${domain.border}`}
              style={{ backgroundColor: '#0d1424' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-xs text-slate-600">{domain.label}</span>
                <h3 className={`text-sm font-semibold ${domain.heading}`}>
                  {domain.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {domain.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${domain.chip.border} ${domain.chip.text}`}
                    style={{ backgroundColor: domain.chip.bg }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
