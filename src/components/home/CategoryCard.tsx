import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";

export interface Category {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  cta: string;
  items: { label: string; note?: string }[];
}

export function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-transform duration-300 hover:-translate-y-1">
      <div className="relative">
        <img
          src={category.image}
          alt={category.title}
          width={1024}
          height={768}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="absolute -bottom-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-card text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-11 pb-7 text-center">
        <h3 className="font-serif text-2xl font-semibold tracking-wide uppercase">
          {category.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{category.description}</p>

        <div className="mt-5">
          <Link to="/equipements" className="btn-gold-outline">
            {category.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-6 space-y-2 text-left">
          {category.items.map((item) => (
            <li key={item.label} className="flex items-baseline gap-2.5 text-sm">
              <Check className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-primary" />
              <span className="text-foreground/90">
                {item.label}
                {item.note && <span className="text-muted-foreground"> {item.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
