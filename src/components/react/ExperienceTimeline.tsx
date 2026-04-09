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
    <section className="border-b border-slate-800 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Experience
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Professional background
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          10+ years in enterprise environments. From workload automation to cloud infrastructure engineering.
        </p>

        <div className="mt-12 space-y-0">
          {experience.map((role, i) => (
            <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center flex-shrink-0 w-5">
                <div
                  className={`mt-1.5 h-3 w-3 rounded-full border-2 flex-shrink-0 ${
                    role.current
                      ? 'border-blue-400 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                />
                {i < experience.length - 1 && (
                  <div className="mt-1.5 w-px flex-1 bg-slate-800" />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 min-w-0 rounded-xl border p-5 mb-1 ${
                  role.current
                    ? 'border-blue-800/60'
                    : 'border-slate-800'
                }`}
                style={{ backgroundColor: role.current ? 'rgba(10,20,50,0.6)' : '#0d1424' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-semibold text-white">
                      {role.title}
                    </h3>
                    {role.current && (
                      <span
                        className="rounded-full border border-blue-700/80 px-2 py-0.5 text-xs font-medium text-blue-300"
                        style={{ backgroundColor: 'rgba(30,58,138,0.3)' }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-500 flex-shrink-0">
                    {role.period}
                  </span>
                </div>

                <p className="mt-1 text-sm font-medium text-blue-400">
                  {role.company}
                </p>

                {role.bullets && role.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {role.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-blue-500" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
