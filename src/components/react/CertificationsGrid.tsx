interface Cert {
  name:    string;
  issuer:  string;
  level?:  string;
  abbr:    string;
  url?:    string;
  borderColor: string;
  bgColor:     string;
  textColor:   string;
}

const certs: Cert[] = [
  {
    name:        'Azure Network Engineer Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/9a4e6132874c2fba',
    borderColor: 'border-blue-700',
    bgColor:     'rgba(30,58,138,0.15)',
    textColor:   'text-blue-400',
  },
  {
    name:        'Azure Administrator Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/43b23aeb5aebe71c',
    borderColor: 'border-blue-700',
    bgColor:     'rgba(30,58,138,0.15)',
    textColor:   'text-blue-400',
  },
  {
    name:        'Terraform Associate (003)',
    issuer:      'HashiCorp Certified',
    abbr:        'HC',
    url:         'https://www.credly.com/badges/f8611b40-d882-4f77-9309-951c70450149/linked_in_profile',
    borderColor: 'border-violet-700',
    bgColor:     'rgba(76,29,149,0.15)',
    textColor:   'text-violet-400',
  },
  {
    name:        'AWS Certified Cloud Practitioner (CLF-C02)',
    issuer:      'Amazon Web Services',
    abbr:        'AWS',
    borderColor: 'border-amber-700',
    bgColor:     'rgba(120,53,15,0.15)',
    textColor:   'text-amber-400',
  },
  {
    name:        'Azure Solutions Architect Expert',
    issuer:      'Microsoft Certified',
    level:       'Expert',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/77d36ccff4a12de2',
    borderColor: 'border-blue-700',
    bgColor:     'rgba(30,58,138,0.15)',
    textColor:   'text-blue-400',
  },
  {
    name:        'Associate Cloud Engineer',
    issuer:      'Google Cloud',
    abbr:        'GCP',
    url:         'https://www.credly.com/badges/8f0a62a8-9ed8-4537-9083-a8959cf65bb5/linked_in_profile',
    borderColor: 'border-emerald-700',
    bgColor:     'rgba(6,78,59,0.15)',
    textColor:   'text-emerald-400',
  },
  {
    name:        'Azure Developer Associate',
    issuer:      'Microsoft Certified',
    level:       'Associate',
    abbr:        'MS',
    url:         'https://learn.microsoft.com/es-es/users/angelluiscatalansanchez-8010/credentials/cabb1b2f0c2e4a0e',
    borderColor: 'border-blue-700',
    bgColor:     'rgba(30,58,138,0.15)',
    textColor:   'text-blue-400',
  },
];

export default function CertificationsGrid() {
  return (
    <section className="border-b border-slate-800 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Certifications
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Certificaciones activas
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Certificaciones vigentes en Azure, HashiCorp, AWS y Google Cloud.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => {
            const cardClass = `rounded-lg border p-5 ${cert.borderColor} ${cert.url ? 'transition-opacity hover:opacity-80 cursor-pointer' : ''}`;
            const inner = (
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${cert.textColor}`}
                  style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}
                >
                  {cert.abbr}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug">
                    {cert.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{cert.issuer}</p>
                  {cert.level && (
                    <span
                      className="mt-2 inline-block rounded px-2 py-0.5 text-xs text-slate-400"
                      style={{ backgroundColor: 'rgba(51,65,85,0.5)' }}
                    >
                      {cert.level}
                    </span>
                  )}
                </div>
              </div>
            );
            return cert.url ? (
              <a
                key={cert.name}
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
                style={{ backgroundColor: cert.bgColor }}
              >
                {inner}
              </a>
            ) : (
              <div
                key={cert.name}
                className={cardClass}
                style={{ backgroundColor: cert.bgColor }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
