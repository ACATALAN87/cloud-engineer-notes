const DIFFICULTY_STYLES: Record<string, { label: string; classes: string }> = {
  beginner:     { label: 'Beginner',     classes: 'border-emerald-800/60 text-emerald-400' },
  intermediate: { label: 'Intermediate', classes: 'border-amber-800/60 text-amber-400' },
  advanced:     { label: 'Advanced',     classes: 'border-red-800/60 text-red-400' },
};

const LAB_TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  'hands-on':   { label: 'Hands-on',    classes: 'border-blue-800/60 text-blue-300' },
  'architecture':{ label: 'Architecture',classes: 'border-violet-800/60 text-violet-300' },
  'devops':     { label: 'DevOps',      classes: 'border-cyan-800/60 text-cyan-300' },
  'security':   { label: 'Security',    classes: 'border-rose-800/60 text-rose-300' },
};

interface ProjectCardProps {
  title:       string;
  description: string;
  stack:       string[];
  href:        string;
  date?:       string;
  difficulty?: string;
  labType?:    string;
}

export default function ProjectCard({ title, description, stack, href, date, difficulty, labType }: ProjectCardProps) {
  const diff    = difficulty ? DIFFICULTY_STYLES[difficulty] : null;
  const labtype = labType    ? LAB_TYPE_STYLES[labType]      : null;

  return (
    <a
      href={href}
      className="group flex flex-col rounded-lg border border-slate-800 p-5 hover:border-slate-600 transition-colors"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Top row: date + badges */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {date && (
          <span className="font-mono text-xs text-slate-500">{date}</span>
        )}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          {labtype && (
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${labtype.classes}`}
              style={{ backgroundColor: 'rgba(15,23,42,0.7)' }}
            >
              {labtype.label}
            </span>
          )}
          {diff && (
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${diff.classes}`}
              style={{ backgroundColor: 'rgba(15,23,42,0.7)' }}
            >
              {diff.label}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors leading-snug">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      {stack.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stack.map((tag) => (
            <span
              key={tag}
              className="rounded border border-slate-700 px-2 py-0.5 font-mono text-xs text-slate-400"
              style={{ backgroundColor: 'rgba(51,65,85,0.3)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
