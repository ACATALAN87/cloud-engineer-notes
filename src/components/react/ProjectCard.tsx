interface ProjectCardProps {
  title:       string;
  description: string;
  stack:       string[];
  href:        string;
  date?:       string;
}

export default function ProjectCard({ title, description, stack, href, date }: ProjectCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-lg border border-slate-800 p-5 hover:border-slate-600 transition-colors"
      style={{ backgroundColor: '#0f172a' }}
    >
      {date && (
        <span className="mb-3 font-mono text-xs text-slate-500">{date}</span>
      )}
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
