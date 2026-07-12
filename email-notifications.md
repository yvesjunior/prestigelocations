# Notes — Notifications par courriel

> Notes de travail (à poursuivre). But : réutiliser le **principe** de l'implémentation
> actuelle, mais l'adapter à nos besoins réels avant d'aller plus loin. Rien ici n'est
> figé.

## Fait (2026-07-11)

- **Fournisseur : SendGrid (API HTTP)**, comme le projet `nanopods-house` (Maisonnovatio).
  `email.ts` fait un `fetch` direct vers `https://api.sendgrid.com/v3/mail/send` (202 = succès) —
  **plus de nodemailer, plus de SMTP** (dépendance retirée du `package.json`). Node 22 fournit
  `fetch` global. Port 443 sortant, rien à ouvrir côté serveur.
- **Module** : `sendMail({to,subject,text,html})` bas niveau, `notifyAdmin` interne, et un
  helper par événement **`notifyNewRequest(payload)`**. `public.ts` appelle
  `void notifyNewRequest({...})` (fire-and-forget). Best-effort : une erreur SendGrid est
  journalisée (`console.warn`), jamais remontée — la demande reste enregistrée.
- **Config** (env) : `SENDGRID_API_KEY` + `SENDGRID_FROM`. Vide → log, aucun envoi (dev par
  défaut). Destinataire = courriel des Coordonnées (BD), jamais en dur. `SENDGRID_FROM` doit
  être un Single Sender vérifié ou sur un domaine authentifié (SPF/DKIM).
- **Gabarit HTML sobre + repli texte** (`content` = text/plain puis text/html) : en-tête
  sombre + accent doré, tableau libellé/valeur, bouton « Traiter dans l'administration ».
  Entrées utilisateur **échappées** (anti-injection). Libellés en français ; langue du
  demandeur = champ.
- **Lien admin absolu** via `BASE_URL` (`${BASE_URL}/admin/demandes`), repli relatif quand
  `VITE_BASE_URL` est vide (dev). En prod (domaine défini) → URL cliquable complète.

> ⚠️ La section « Ce qui existe aujourd'hui » ci-dessous décrit l'ANCIENNE implémentation
> nodemailer/SMTP et n'est plus à jour — conservée seulement pour l'historique.

## Ce qui existe aujourd'hui

**`src/web/src/server/impl/email.ts`** — une seule fonction :

- `notifyAdmin(subject, text)` :
  - lit `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` (env) ;
  - **config absente → log `console.info` + retour** (aucune erreur, le dev marche sans SMTP) ;
  - nodemailer, `secure` si port 465, sinon STARTTLS (587) ;
  - **destinataire = courriel de l'entreprise lu en BD** (`loadContact()`), jamais en dur ;
  - courriel **texte brut** ;
  - `try/catch` : un échec est journalisé (`console.warn`), **jamais remonté**.

**Appel** — `src/web/src/server/impl/public.ts`, dans `submitReservationRequest`, **après**
l'insertion en BD :

```ts
void notifyAdmin(sujet, corps); // fire-and-forget : non attendu, non bloquant
```

**Câblage env** : `.env.example` (bloc `SMTP_*`) + `infra/docker-compose.yml` (passthrough).
🧍 En attente client : identifiants SMTP réels (ex. Outlook `smtp-mail.outlook.com:587`).

## Le principe à conserver (c'est l'essentiel)

1. **BD = source de vérité, courriel = best-effort.** L'action métier (enregistrer la
   demande) réussit toujours ; le courriel ne doit jamais la faire échouer.
2. **Non bloquant** : `void` (pas d'`await` sur le chemin critique) + `try/catch` interne,
   jamais de `throw` qui remonte.
3. **Gaté par l'environnement** : pas de config SMTP → log, pas de crash.
4. **Adresses depuis la BD**, pas codées en dur.
5. **Import dynamique** côté serveur uniquement (respecte la frontière `server/impl/*`).

## À implémenter / adapter (à trancher plus tard)

- **Généraliser le module** : extraire un `sendMail({ to, subject, text, html? })` bas niveau
  (transporter **mémoïsé** — créé une fois, pas à chaque envoi), et des helpers par
  événement au-dessus (`notifyNewRequest`, `notifyOrderConfirmed`, …). `notifyAdmin`
  devient un cas particulier.

- **Événements candidats** (choisir selon le besoin client) :
  - ✅ Nouvelle demande → **admin** (déjà fait).
  - Demande validée / commande créée → **client**. ⚠️ **Blocage à régler d'abord** : le
    formulaire public ne collecte **pas** le courriel du client (nom + téléphone seulement) ;
    `customers.email` est optionnel. Pour confirmer au client il faut soit ajouter un champ
    « courriel (optionnel) » au formulaire de demande, soit ne notifier que si l'employé a
    saisi un courriel sur la fiche client.
  - Commande annulée → client (optionnel).

- **Format HTML** : passer d'un texte brut à un gabarit HTML sobre (couleurs du thème) avec
  repli texte. Plus pro pour un courriel client.

- **Délivrabilité** (Phase 5/7, avec le domaine final) : `SMTP_FROM` sur le domaine +
  SPF/DKIM configurés, sinon risque de spam. À documenter dans `infra/README.md`.

- **Test local sans vrai SMTP** : lancer un Mailpit/MailHog en conteneur (ou compte
  Ethereal) et pointer `SMTP_*` dessus ; documenter la recette dans `.env.example`/README.

- **Traçabilité (optionnel)** : si le gérant veut savoir ce qui est parti, journaliser
  l'envoi ou ajouter un `notified_at` sur `reservation_requests`. Probablement superflu au
  lancement (le volume est faible et la demande est déjà visible dans `/admin/demandes`).

- **Anti-abus** : le rate-limit du formulaire public (5 / 10 min / IP) borne déjà le nombre
  de courriels sortants — rien à ajouter côté envoi.

## Gabarit actuel (à copier / modifier)

Le « gabarit » aujourd'hui = le corps texte construit en ligne dans
`submitReservationRequest` (`server/impl/public.ts`). Copié ici tel quel comme point de
départ à réutiliser et adapter (ex. version HTML, autres événements, confirmation client) :

```ts
// Sujet
`Nouvelle demande de réservation — ${equipmentLabel}`

// Corps (texte brut ; lignes vides et champ Message conditionnel)
const period = hasRange ? `du ${data.startDate} au ${data.endDate}` : "période non précisée";
[
  `Nom : ${data.name}`,
  `Téléphone : ${data.phone}`,
  `Équipement : ${equipmentLabel}`,
  `Période souhaitée : ${period}`,
  `Langue : ${data.lang}`,
  data.message ? `Message :\n${data.message}` : null,
  "",
  "À traiter dans l'administration : /admin/demandes",
]
  .filter((l) => l !== null)
  .join("\n");
```

Pistes de modification prévues :
- passer à un gabarit **HTML** (mêmes champs) + repli texte ;
- rendre les libellés **bilingues** selon `data.lang` (le corps est en français seulement) ;
- lien admin en **URL absolue** (`${BASE_URL}/admin/demandes`) plutôt que chemin relatif ;
- variantes par événement : confirmation **client** (si courriel dispo), commande annulée…

## Fichiers concernés

- `src/web/src/server/impl/email.ts` — module d'envoi (à généraliser).
- `src/web/src/server/impl/public.ts` — appel après l'insertion d'une demande.
- `.env.example`, `infra/docker-compose.yml` — variables `SMTP_*`.
- *(si confirmation client)* `src/web/src/components/pages/ContactPage.tsx` + le schéma/serveur
  de la demande (ajout d'un courriel client optionnel).
