import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { useLang, useT } from "@/lib/i18n";
import { useCatalog } from "@/lib/useCatalog";
import { EMAIL, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export function ContactPage() {
  const lang = useLang();
  const t = useT();
  const { equipments } = useCatalog();
  const [sent, setSent] = useState(false);

  const equipmentOptions = [
    ...equipments
      .filter((e) => e.featured && e.status === "disponible")
      .map((e) => (e.formLabel ?? e.name)[lang]),
    t.contactPage.otherOption,
  ];

  const infos = [
    {
      icon: Phone,
      label: t.contactPage.infos.phoneLabel,
      value: PHONE_DISPLAY,
      href: PHONE_HREF,
      note: t.contactPage.infos.phoneNote,
    },
    {
      icon: Mail,
      label: t.contactPage.infos.emailLabel,
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      note: t.contactPage.infos.emailNote,
    },
    {
      icon: MapPin,
      label: t.contactPage.infos.regionLabel,
      value: t.contactPage.infos.regionValue,
      note: t.contactPage.infos.regionNote,
    },
  ];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(
      `${t.contactPage.mailSubject} — ${data.get("equipement") || t.contactPage.mailFallbackEquipment}`,
    );
    const body = encodeURIComponent(
      `${t.contactPage.mailBody.name} : ${data.get("nom")}\n${t.contactPage.mailBody.phone} : ${data.get("telephone")}\n${t.contactPage.mailBody.equipment} : ${data.get("equipement")}\n\n${t.contactPage.mailBody.message} :\n${data.get("message")}`,
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

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
              <p className="mt-1 text-sm text-muted-foreground">{t.contactPage.sentText}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nom"
                    className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                  >
                    {t.contactPage.nameLabel}
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    required
                    className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder={t.contactPage.namePlaceholder}
                  />
                </div>
                <div>
                  <label
                    htmlFor="telephone"
                    className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                  >
                    {t.contactPage.phoneLabel}
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder={t.contactPage.phonePlaceholder}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="equipement"
                  className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                >
                  {t.contactPage.equipmentLabel}
                </label>
                <select
                  id="equipement"
                  name="equipement"
                  className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {equipmentOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
                >
                  {t.contactPage.messageLabel}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder={t.contactPage.messagePlaceholder}
                />
              </div>
              <button type="submit" className="btn-gold w-full">
                {t.contactPage.submit}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
