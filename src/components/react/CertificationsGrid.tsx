import { useRef } from 'react';

interface Cert {
  name:        string;
  issuer:      string;
  level?:      string;
  abbr:        string;
  url?:        string;
  featured?:   boolean;
  accent:      string;
  textColor:   string;
  glow:        string;
}

const certs: Cert[] = [
  {
    name:        'Azure Solutions Architect Expert',
    issuer:      'Microsoft Certified',
    level:       'Expert',
    abbr:        'MS',
    featured:    true,
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/77d36ccff4a12de2',
    accent:      'from-blue-400 to-cyan-400',
    textColor:   'text-blue-300',
    glow:        'rgba(59, 130, 246, 0.3)',
  },
  {
    name:        'Terraform Associate (003)',
    issuer:      'HashiCorp Certified',
    level:       'Associate',
    abbr:        'HC',
    featured:    true,
    url:         'https://www.credly.com/badges/f8611b40-d882-4f77-9309-951c70450149/linked_in_profile',
    accent:      'from-violet-400 to-fuchsia-400',
    textColor:   'text-violet-300',
    glow:        'rgba(168, 85, 247, 0.3)',
  },
  {
    name:        'Azure Developer Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/cabb1b2f0c2e4a0e',
    accent:      'from-blue-500/60 to-blue-700/60',
    textColor:   'text-blue-300',
    glow:        'rgba(59, 130, 246, 0.18)',
  },
  {
    name:        'Azure Administrator Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/43b23aeb5aebe71c',
    accent:      'from-blue-500/60 to-blue-700/60',
    textColor:   'text-blue-300',
    glow:        'rgba(59, 130, 246, 0.18)',
  },
  {
    name:        'Azure Network Engineer Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/9a4e6132874c2fba',
    accent:      'from-blue-500/60 to-blue-700/60',
    textColor:   'text-blue-300',
    glow:        'rgba(59, 130, 246, 0.18)',
  },
  {
    name:        'AWS Certified Cloud Practitioner (CLF-C02)',
    issuer:      'Amazon Web Services',
    abbr:        'AWS',
    accent:      'from-amber-400/70 to-orange-500/70',
    textColor:   'text-amber-300',
    glow:        'rgba(245, 158, 11, 0.2)',
  },
  {
    name:        'Associate Cloud Engineer',
    issuer:      'Google Cloud',
    abbr:        'GCP',
    url:         'https://www.credly.com/badges/8f0a62a8-9ed8-4537-9083-a8959cf65bb5/linked_in_profile',
    accent:      'from-emerald-400/70 to-teal-500/70',
    textColor:   'text-emerald-300',
    glow:        'rgba(16, 185, 129, 0.2)',
  },
];

function CertCard({ cert, idx, featured }: { cert: Cert; idx: number; featured: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const inner = (
    <div className="flex items-start gap-4">
      <div
        className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cert.accent} font-mono text-xs font-bold text-white`}
        style={{ boxShadow: `0 8px 20px -6px ${cert.glow}` }}
      >
        {cert.abbr}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-sm font-semibold leading-snug ${featured ? 'text-white' : 'text-slate-200'}`}>
            {cert.name}
          </p>
          {featured && (
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${cert.textColor}`}
              style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}
            >
              {cert.level ?? 'Key'}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{cert.issuer}</p>
        {!featured && cert.level && (
          <span
            className="mt-1.5 inline-block rounded px-2 py-0.5 text-xs text-slate-400"
            style={{ backgroundColor: 'rgba(51,65,85,0.4)' }}
          >
            {cert.level}
          </span>
        )}
        {cert.url && (
          <p className={`mt-2 inline-flex items-center gap-1 text-xs ${cert.textColor} opacity-70 group-hover:opacity-100 transition-opacity`}>
            Ver credencial
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </p>
        )}
      </div>
    </div>
  );

  const delayClass = idx < 6 ? `reveal-delay-${idx + 1}` : 'reveal-delay-6';
  const baseClass = `reveal ${delayClass} group spotlight glass-card block rounded-2xl p-5 relative overflow-hidden`;

  return cert.url ? (
    <a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      onMouseMove={onMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
    >
      {inner}
    </a>
  ) : (
    <div ref={ref} onMouseMove={onMove} className={baseClass}>
      {inner}
    </div>
  );
}

export default function CertificationsGrid() {
  const featured = certs.filter((c) => c.featured);
  const rest     = certs.filter((c) => !c.featured);

  return (
    <section className="relative border-b border-slate-800/60 py-24" style={{ backgroundColor: '#040818' }}>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-12 max-w-2xl">
          <span className="eyebrow">Certificaciones</span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Credenciales <span className="text-gradient-static">activas</span>
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Certificaciones verificadas en Azure, HashiCorp, AWS y Google Cloud.
          </p>
        </div>

        {/* Featured row */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          {featured.map((cert, idx) => (
            <CertCard key={cert.name} cert={cert} idx={idx} featured={true} />
          ))}
        </div>

        {/* Rest */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((cert, idx) => (
            <CertCard key={cert.name} cert={cert} idx={idx + 2} featured={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
