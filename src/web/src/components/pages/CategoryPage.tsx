import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CdnImage } from "@/components/site/CdnImage";
import { CtaSection } from "@/components/site/CtaSection";
import { SectionTitle } from "@/components/site/SectionTitle";
import { statusSuffix, withCode } from "@/lib/catalog";
import { BLANK_IMAGE } from "@/lib/images";
import { pagePaths, useLang, useT } from "@/lib/i18n";
import { useCatalog } from "@/lib/useCatalog";
import { usePricing } from "@/lib/usePricing";
import { formatMoney, RATE_PERIODS } from "@/lib/pricing";
import { useIsAdvanced } from "@/lib/useMode";

/**
 * Page publique d'une catégorie : ses équipements (BD) avec le bouton
 * « Vérifier la disponibilité » vers la page contact. La route garantit que
 * le slug existe (notFound sinon).
 */
export function CategoryPage({ slug }: { slug: string }) {
  const lang = useLang();
  const t = useT();
  const { categories, equipments } = useCatalog();
  const pricing = usePricing();
  const advanced = useIsAdvanced();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null; // la route a déjà validé le slug (notFound)

  const items = equipments.filter((e) => e.category === slug);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:px-8">
        <Link
          to={pagePaths.equipment[lang]}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.categoryPage.back}
        </Link>
        <div className="mt-6">
          <SectionTitle
            eyebrow={t.equipmentPage.eyebrow}
            title={category.name[lang]}
            subtitle={category.pageDescription[lang]}
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t.categoryPage.empty}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => {
              const suffix = statusSuffix(e.status)?.[lang];
              return (
                <article
                  key={e.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card"
                >
                  <CdnImage
                    imageKey={e.imageKey}
                    fallbackSrc={BLANK_IMAGE}
                    alt={e.name[lang]}
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-serif text-xl font-semibold tracking-wide uppercase">
                      {withCode(e.name[lang], e.code)}
                    </h2>
                    {suffix && <p className="mt-1 text-xs text-primary">{suffix}</p>}
                    {pricing.showDailyPrice &&
                      (() => {
                        // Seules les périodes renseignées sont affichées.
                        const rates = RATE_PERIODS.map((p) => ({
                          key: p.labelKey,
                          cents: e[p.field],
                        })).filter((r) => r.cents != null);
                        if (rates.length === 0) return null;
                        return (
                          <ul className="mt-2 space-y-0.5">
                            {rates.map((r) => (
                              <li key={r.key} className="font-semibold text-primary">
                                {formatMoney(r.cents!, lang)}
                                <span className="text-sm font-normal text-muted-foreground">
                                  {" "}
                                  {t.equipmentPage.periods[r.key]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {e.detail?.[lang] ?? ""}
                    </p>
                    <div className="mt-5">
                      {/* Préselectionne l'équipement dans le formulaire de contact
                          (son calendrier de disponibilité s'affiche directement). */}
                      <Link
                        to={pagePaths.contact[lang]}
                        search={{ equipement: e.slug }}
                        className="btn-gold-outline"
                      >
                        {advanced ? t.equipmentPage.checkAvailability : t.equipmentPage.request}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <CtaSection />
    </>
  );
}
