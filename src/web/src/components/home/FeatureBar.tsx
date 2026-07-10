import { Clock, Headset, ShieldCheck, ThumbsUp } from "lucide-react";
import { useT } from "@/lib/i18n";

const icons = [ShieldCheck, ThumbsUp, Clock, Headset];

export function FeatureBar() {
  const t = useT();

  return (
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-px sm:grid-cols-2 lg:grid-cols-4">
        {t.features.map((f, i) => {
          const Icon = icons[i];
          return (
            <div
              key={f.title}
              className="flex flex-col items-center px-6 py-10 text-center lg:border-l lg:border-border/60 lg:first:border-l-0"
            >
              <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 text-sm font-bold tracking-[0.12em] uppercase">{f.title}</h3>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
