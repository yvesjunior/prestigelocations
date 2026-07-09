interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="text-center">
      {eyebrow && (
        <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">{eyebrow}</p>
      )}
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-foreground uppercase md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="title-rule mt-2 font-serif text-lg tracking-wider text-primary uppercase md:text-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
