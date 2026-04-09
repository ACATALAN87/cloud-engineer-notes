interface Role {
  company:  string;
  title:    string;
  period:   string;
  current?: boolean;
  bullets?: string[];
}

const experience: Role[] = [
  {
    company: 'Kyndryl',
    title:   'Cloud Infrastructure Engineer',
    period:  'Ene 2025 – Presente',
    current: true,
    bullets: [
      'Diseño y despliegue de infraestructura Azure con Terraform',
      'Azure networking, seguridad y troubleshooting de conectividad',
      'Integraciones CI/CD con Azure DevOps y GitHub para Azure Data Factory',
      'Diseño y soporte de entornos Azure DevOps: service connections, pipelines, agent pools',
      'Aprovisionamiento y administración de Snowflake con RBAC',
      'Automatización de despliegue de Couchbase Capella con GitHub Actions e IaC',
      'Soporte de plataformas Appian',
    ],
  },
  {
    company: 'Kyndryl',
    title:   'Workload Automation Administrator',
    period:  'Sep 2021 – Ene 2025',
    bullets: [
      'Gestión de plataformas enterprise de automatización de cargas de trabajo',
      'Scripting Shell para automatización de procesos',
      'Administración de Oracle, DB2 y SQL Server',
      'IBM InfoSphere Data Replication',
      'Operación de entornos críticos 24x7 y transferencias seguras',
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
    period:  'Abr 2014 – Jul 2015',
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
          Trayectoria profesional
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Más de 10 años en entornos enterprise. De workload automation a cloud infrastructure.
        </p>

        <div className="mt-12">
          {experience.map((role, i) => (
            <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
              {/* Timeline connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`mt-1.5 h-3 w-3 rounded-full border-2 flex-shrink-0 ${
                    role.current
                      ? 'border-blue-400 bg-blue-400'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                />
                {i < experience.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-slate-800" style={{ minHeight: '24px' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {role.title}
                  </h3>
                  {role.current && (
                    <span
                      className="rounded-full border border-blue-700 px-2 py-0.5 text-xs font-medium text-blue-300"
                      style={{ backgroundColor: 'rgba(30,58,138,0.3)' }}
                    >
                      Actual
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm font-medium text-blue-400">
                  {role.company}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {role.period}
                </p>

                {role.bullets && role.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {role.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-blue-600" />
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
