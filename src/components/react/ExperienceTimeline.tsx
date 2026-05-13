interface Role {
  company:     string;
  title:       string;
  period:      string;
  current?:    boolean;
  bullets?:    string[];
}

const experience: Role[] = [
  {
    company: 'Kyndryl',
    title:   'Cloud Infrastructure Engineer',
    period:  'Jan 2025 – Present',
    current: true,
    bullets: [
      'Azure infrastructure design and deployment with Terraform',
      'Azure networking, security and connectivity troubleshooting',
      'CI/CD integration with Azure DevOps and GitHub for Azure Data Factory',
      'Azure DevOps environment design: service connections, pipelines, agent pools',
      'Snowflake provisioning and RBAC administration',
      'Couchbase Capella deployment automation with GitHub Actions and IaC',
      'Appian platform support and configuration',
    ],
  },
  {
    company: 'Kyndryl',
    title:   'Workload Automation Administrator',
    period:  'Sep 2021 – Jan 2025',
    bullets: [
      'Enterprise workload automation platform management',
      'Shell scripting for process and pipeline automation',
      'Oracle, DB2 and SQL Server administration',
      'IBM InfoSphere Data Replication setup and maintenance',
      '24x7 critical environments operation and secure file transfer',
    ],
  },
  {
    company: 'Viewnext',
    title:   'Workload Automation Administrator',
    period:  'Jun 2016 – Sep 2021',
  },
  {
    company: 'IBM',
    title:   'Control-M Administrator',
    period:  'Jul 2015 – Jun 2016',
  },
  {
    company: 'Hewlett Packard Enterprise',
    title:   'Control-M Administrator',
    period:  'Apr 2014 – Jul 2015',
  },
];

export default function ExperienceTimeline() {
  return (
    <section className="relative border-b border-slate-800/60 py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-12 max-w-2xl">
          <span className="eyebrow">Experience</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Professional <span className="text-gradient-static">background</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            10+ años en entornos enterprise. De workload automation a cloud
            infrastructure engineering.
          </p>
        </div>

        <div className="relative">
          {/* Vertical gradient line */}
          <div
            className="absolute left-2 top-2 bottom-2 w-px"
            aria-hidden="true"
            style={{
              background: 'linear-gradient(to bottom, rgba(96,165,250,0.6), rgba(168,85,247,0.4), rgba(51,65,85,0.2))',
            }}
          />

          <div className="space-y-6">
            {experience.map((role, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${Math.min(i + 1, 6)} relative flex gap-6 pl-10`}
              >
                {/* Node */}
                <div
                  className={`absolute left-0 top-3 flex h-5 w-5 items-center justify-center rounded-full ${
                    role.current ? 'animate-pulse-glow' : ''
                  }`}
                  aria-hidden="true"
                  style={{
                    background: role.current
                      ? 'radial-gradient(circle, #60a5fa 30%, rgba(59,130,246,0.2) 70%)'
                      : 'radial-gradient(circle, #475569 30%, rgba(51,65,85,0.3) 70%)',
                  }}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      role.current ? 'bg-white' : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Card */}
                <div
                  className={`flex-1 min-w-0 glass-card rounded-2xl p-6 ${
                    role.current ? 'ring-1 ring-blue-500/20' : ''
                  }`}
                  style={role.current ? {
                    background: 'linear-gradient(135deg, rgba(30,58,138,0.25), rgba(15,23,42,0.4))',
                  } : undefined}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-semibold text-white">
                        {role.title}
                      </h3>
                      {role.current && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-blue-400/40 px-2 py-0.5 text-xs font-medium text-blue-200"
                          style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.5), rgba(76,29,149,0.3))' }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-blink-soft" />
                          Current
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-500 flex-shrink-0">
                      {role.period}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-blue-300">
                    {role.company}
                  </p>

                  {role.bullets && role.bullets.length > 0 && (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {role.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 h-3 w-3 flex-shrink-0 text-blue-400" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
