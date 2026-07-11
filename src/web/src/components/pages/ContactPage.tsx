import { useSearch } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { enUS, fr } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { SectionTitle } from "@/components/site/SectionTitle";
import { useLang, useT } from "@/lib/i18n";
import { withCode } from "@/lib/catalog";
import { useCatalog } from "@/lib/useCatalog";
import { phoneHref } from "@/lib/contact";
import { useContact } from "@/lib/useContact";
import { getUnavailableRangesFn, submitReservationRequestFn } from "@/server/public";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const labelCls = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";

/** "AAAA-MM-JJ" ↔ Date locale (jamais UTC : les journées sont locales). */
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function fromIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ContactPage() {
  const lang = useLang();
  const t = useT();
  const contact = useContact();
  const { equipments } = useCatalog();

  // Tous les équipements publiés (la BD est la source de vérité) — les statuts
  // « bientôt » / « sur demande » se demandent aussi.
  const options = equipments;
  const search = useSearch({ strict: false }) as { equipement?: string };
  const preselected =
    search.equipement && options.some((e) => e.slug === search.equipement) ? search.equipement : "";

  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState<string>(preselected); // "" = Autre / plusieurs équipements
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — reste vide chez un humain
  const [range, setRange] = useState<DateRange | undefined>();
  const [unavailable, setUnavailable] = useState<{ start: string; end: string }[]>([]);

  // Périodes réservées de l'équipement choisi (grisées dans le calendrier).
  useEffect(() => {
    setRange(undefined);
    if (!slug) {
      setUnavailable([]);
      return;
    }
    let stale = false;
    getUnavailableRangesFn({ data: { slug } })
      .then((ranges) => {
        if (!stale) setUnavailable(ranges);
      })
      .catch(() => setUnavailable([]));
    return () => {
      stale = true;
    };
  }, [slug]);

  const disabledDays = [
    { before: new Date() },
    ...unavailable.map((r) => ({ from: fromIso(r.start), to: fromIso(r.end) })),
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Équipement précis → la période est obligatoire (le serveur revérifie).
    if (slug && !range?.from) {
      setError(t.contactPage.errors.dates_required);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitReservationRequestFn({
        data: {
          name,
          phone,
          equipmentSlug: slug || null,
          startDate: range?.from ? toIso(range.from) : null,
          endDate: range?.to ? toIso(range.to) : range?.from ? toIso(range.from) : null,
          message: message.trim() || null,
          lang,
          website,
        },
      });
      if (!result.ok) {
        const key = result.error ?? "generic";
        setError(t.contactPage.errors[key].replace("{phone}", contact.phone));
        return;
      }
      setSent(true);
    } catch {
      setError(t.contactPage.errors.generic.replace("{phone}", contact.phone));
    } finally {
      setBusy(false);
    }
  }

  const infos = [
    {
      icon: Phone,
      label: t.contactPage.infos.phoneLabel,
      value: contact.phone,
      href: phoneHref(contact.phone),
      note: t.contactPage.infos.phoneNote,
    },
    {
      icon: Mail,
      label: t.contactPage.infos.emailLabel,
      value: contact.email,
      href: `mailto:${contact.email}`,
      note: t.contactPage.infos.emailNote,
    },
    {
      icon: MapPin,
      label: t.contactPage.infos.regionLabel,
      value: t.contactPage.infos.regionValue,
      note: t.contactPage.infos.regionNote,
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 lg:px-8">
        <SectionTitle
          eyebrow={t.contactPage.eyebrow}
          title={t.contactPage.title}
          subtitle={t.contactPage.subtitle}
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 lg:grid-cols-[1fr_1.3fr] lg:px-8">
        <div className="space-y-5">
          {infos.map((info) => (
            <div
              key={info.label}
              className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/60 text-primary">
                <info.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase">
                  {info.label}
                </p>
                {info.href ? (
                  <a
                    href={info.href}
                    className="mt-1 block text-lg font-semibold break-all transition-colors hover:text-primary"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg font-semibold">{info.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{info.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-7 md:p-9">
          <h2 className="font-serif text-2xl font-semibold tracking-wide uppercase">
            {t.contactPage.formTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.contactPage.formIntro}</p>

          {sent ? (
            <div className="mt-8 rounded-lg border border-primary/40 bg-secondary p-6 text-center">
              <p className="font-semibold text-primary">{t.contactPage.sentTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.contactPage.sentText.replace("{phone}", contact.phone)}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nom" className={labelCls}>
                    {t.contactPage.nameLabel}
                  </label>
                  <input
                    id="nom"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder={t.contactPage.namePlaceholder}
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className={labelCls}>
                    {t.contactPage.phoneLabel}
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    required
                    minLength={7}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                    placeholder={t.contactPage.phonePlaceholder}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="equipement" className={labelCls}>
                  {t.contactPage.equipmentLabel}
                </label>
                <select
                  id="equipement"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputCls}
                >
                  {/* « Autre » en tête : c'est la valeur par défaut (pas de calendrier). */}
                  <option value="">{t.contactPage.otherOption}</option>
                  {options.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {withCode((e.formLabel ?? e.name)[lang], e.code)}
                    </option>
                  ))}
                </select>
              </div>

              {slug && (
                <div>
                  <p className={labelCls}>{t.contactPage.datesLabel}</p>
                  <div className="rounded-md border border-input p-1">
                    {/* Un mois à la fois, navigation par les flèches ‹ ›.
                        ⚠️ `relative` sur root est requis : la nav (flèches) est en
                        position absolue et s'y ancre — sans ça elle fuyait en haut
                        de la page, hors de portée du clic. */}
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      disabled={disabledDays}
                      excludeDisabled
                      numberOfMonths={1}
                      locale={lang === "fr" ? fr : enUS}
                      buttonVariant="outline"
                      className="w-full [--cell-size:2.6rem]"
                      classNames={{
                        root: "relative w-full",
                        months: "w-full",
                        month: "flex w-full flex-col gap-4",
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{t.contactPage.datesHint}</span>
                    {range?.from && (
                      <span className="flex items-center gap-2">
                        <span className="text-primary">
                          {t.contactPage.datesSelected
                            .replace("{start}", toIso(range.from))
                            .replace("{end}", toIso(range.to ?? range.from))}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRange(undefined)}
                          className="underline hover:text-primary"
                        >
                          {t.contactPage.datesClear}
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="message" className={labelCls}>
                  {t.contactPage.messageLabel}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputCls}
                  placeholder={t.contactPage.messagePlaceholder}
                />
              </div>

              {/* Honeypot anti-spam : invisible pour les humains. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">{t.contactPage.notBookingNote}</p>
              <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
                {busy ? "…" : t.contactPage.submit}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
