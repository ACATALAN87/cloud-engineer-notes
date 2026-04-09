interface Cert {
  name:        string;
  issuer:      string;
  level?:      string;
  abbr:        string;
  url?:        string;
  featured?:   boolean;
  borderColor: string;
  bgColor:     string;
  textColor:   string;
}

const certs: Cert[] = [
  {
    name:        'Azure Solutions Architect Expert',
    issuer:      'Microsoft Certified',
    level:       'Expert',
    abbr:        'MS',
    featured:    true,
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/77d36ccff4a12de2',
    borderColor: 'border-blue-600/70',
    bgColor:     'rgba(30,58,138,0.2)',
    textColor:   'text-blue-400',
  },
  {
    name:        'Terraform Associate (003)',
    issuer:      'HashiCorp Certified',
    abbr:        'HC',
    featured:    true,
    url:         'https://www.credly.com/badges/f8611b40-d882-4f77-9309-951c70450149/linked_in_profile',
    borderColor: 'border-violet-600/70',
    bgColor:     'rgba(76,29,149,0.2)',
    textColor:   'text-violet-400',
  },
  {
    name:        'Azure Developer Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/cabb1b2f0c2e4a0e',
    borderColor: 'border-blue-800/60',
    bgColor:     'rgba(30,58,138,0.12)',
    textColor:   'text-blue-400',
  },
  {
    name:        'Azure Administrator Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/43b23aeb5aebe71c',
    borderColor: 'border-blue-800/60',
    bgColor:     'rgba(30,58,138,0.12)',
    textColor:   'text-blue-400',
  },
  {
    name:        'Azure Network Engineer Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/9a4e6132874c2fba',
    borderColor: 'border-blue-800/60',
    bgColor:     'rgba(30,58,138,0.12)',
    textColor:   'text-blue-400',
  },
  {
    name:        'AWS Certified Cloud Practitioner (CLF-C02)',
    issuer:      'Amazon Web Services',
    abbr:        'AWS',
    borderColor: 'border-amber-800/60',
    bgColor:     'rgba(120,53,15,0.12)',
    textColor:   'text-amber-400',
  },
  {
    name:        'Associate Cloud Engineer',
    issuer:      'Google Cloud',
    abbr:        'GCP',
    url:         'https://www.credly.com/badges/8f0a62a8-9ed8-4537-9083-a8959cf65bb5/linked_in_profile',
    borderColor: 'border-emerald-800/60',
    bgColor:     'rgba(6,78,59,0.12)',
    textColor:   'text-emerald-400',
  },
];

function CertCard({ cert }: { cert: Cert }) {
  const inner = (
    <div className="flex items-start gap-4">
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${cert.textColor}`}
        style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}
      >
        {cert.abbr}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-sm font-semibold leading-snug ${cert.featured ? 'text-white' : 'text-slate-200'}`}>
            {cert.name}
          </p>
          {cert.featured && (
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${cert.textColor}`}
              style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}
            >
              {cert.level ?? 'Key'}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{cert.issuer}</p>
        {!cert.featured && cert.level && (
          <span
            className="mt-1.5 inline-block rounded px-2 py-0.5 text-xs text-slate-400"
            style={{ backgroundColor: 'rgba(51,65,85,0.4)' }}
          >
            {cert.level}
          </span>
        )}
        {cert.url && (
          <p className={`mt-1.5 text-xs ${cert.textColor} opacity-70`}>
            View credential →
          </p>
        )}
      </div>
    </div>
  );

  const baseClass = `rounded-xl border p-5 ${cert.borderColor} ${
    cert.url ? 'transition-all hover:opacity-85 hover:border-opacity-100 cursor-pointer' : ''
  } ${cert.featured ? 'ring-1 ring-inset ' + cert.borderColor : ''}`;

  return cert.url ? (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
      style={{ backgroundColor: cert.bgColor }}
    >
      {inner}
    </a>
  ) : (
    <div className={baseClass} style={{ backgroundColor: cert.bgColor }}>
      {inner}
    </div>
  );
}

export default function CertificationsGrid() {
  const featured = certs.filter((c) => c.featured);
  const rest     = certs.filter((c) => !c.featured);

  return (
    <section className="border-b border-slate-800 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Certifications
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Active certifications
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Verified credentials across Azure, HashiCorp, AWS and Google Cloud.
        </p>

        {/* Featured row */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featured.map((cert) => (
            <CertCard key={cert.name} cert={cert} />
          ))}
        </div>

        {/* Rest */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((cert) => (
            <CertCard key={cert.name} cert={cert} />
          ))}
        </div>
      </div>
    </section>
  );
}
