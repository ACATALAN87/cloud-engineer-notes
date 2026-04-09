interface SectionTitleProps {
  label:        string;
  title:        string;
  description?: string;
}

export default function SectionTitle({ label, title, description }: SectionTitleProps) {
  return (
    <div className="mb-10">
      <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        {label}
      </span>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-slate-400">{description}</p>
      )}
    </div>
  );
}
