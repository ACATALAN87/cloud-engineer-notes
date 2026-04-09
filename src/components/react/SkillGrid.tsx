interface Skill {
  name: string;
  category: 'cloud' | 'iac' | 'devops' | 'infra' | 'data' | 'scripting';
}

const skills: Skill[] = [
  { name: 'Azure',                category: 'cloud' },
  { name: 'Platform Engineering', category: 'cloud' },
  { name: 'Terraform',            category: 'iac' },
  { name: 'Azure DevOps',         category: 'devops' },
  { name: 'GitHub Actions',       category: 'devops' },
  { name: 'CI/CD',                category: 'devops' },
  { name: 'Networking',           category: 'infra' },
  { name: 'Linux',                category: 'infra' },
  { name: 'Windows Server',       category: 'infra' },
  { name: 'Enterprise Infra',     category: 'infra' },
  { name: 'Snowflake',            category: 'data' },
  { name: 'Couchbase Capella',    category: 'data' },
  { name: 'Bash / Shell',         category: 'scripting' },
  { name: 'SQL',                  category: 'scripting' },
];

const categoryStyles: Record<Skill['category'], { border: string; text: string; bg: string }> = {
  cloud:     { border: 'border-blue-700',   text: 'text-blue-300',   bg: 'rgba(30,58,138,0.2)' },
  iac:       { border: 'border-violet-700', text: 'text-violet-300', bg: 'rgba(76,29,149,0.2)' },
  devops:    { border: 'border-purple-700', text: 'text-purple-300', bg: 'rgba(88,28,135,0.2)' },
  infra:     { border: 'border-slate-600',  text: 'text-slate-300',  bg: 'rgba(51,65,85,0.4)' },
  data:      { border: 'border-cyan-700',   text: 'text-cyan-300',   bg: 'rgba(21,94,117,0.2)' },
  scripting: { border: 'border-amber-700',  text: 'text-amber-300',  bg: 'rgba(120,53,15,0.2)' },
};

export default function SkillGrid() {
  return (
    <section className="border-b border-slate-800 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Core Skills
        </span>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Stack técnico principal
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Tecnologías y plataformas con las que trabajo en entornos enterprise.
        </p>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {skills.map((skill) => {
            const style = categoryStyles[skill.category];
            return (
              <span
                key={skill.name}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${style.border} ${style.text}`}
                style={{ backgroundColor: style.bg }}
              >
                {skill.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
