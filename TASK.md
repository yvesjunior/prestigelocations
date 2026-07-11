# TASK.md — Plan de travail technique

> Basé sur [PROJET.md](PROJET.md) (gelé — ne pas le modifier). Ce fichier est le **guide
> d'exécution** : chaque phase précise ses dépendances, la démarche, les choix (tranchés ou
> à trancher) et son critère de complétion. Une session IA ou un développeur junior doit
> pouvoir exécuter une phase en lisant uniquement ce fichier et le code.

## Conventions de travail

- **Langue** : site et interface d'admin en français d'abord ; code et commits en anglais.
- **Outils** : npm (pas bun — non installé sur la machine de dev) ; serveur de dev
  `npm run dev` à la racine (proxy vers `src/web`, port 8080).
- **Qualité** : avant de terminer une tâche → `npx tsc --noEmit` et `npx eslint` sur les
  fichiers touchés (le dépôt a du bruit CRLF pré-existant : ne corriger que ses fichiers).
- **Toujours finir par un build Docker** : le serveur de dev ne prouve pas l'image de prod
  (build args `VITE_*`, `NODE_ENV=production`, sortie nitro). Après chaque changement :
  `docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.dev.yml
  up -d --build web`, puis vérifier conteneur `healthy` + `curl localhost:3000/fr` + la
  fonctionnalité modifiée. (Le conteneur ne hot-reload pas ; migrations/seed à la main.)
- **Git** : jamais de réécriture d'historique poussé (pas de force-push/rebase de commits
  publiés). Commits au format Conventional Commits, sans mention d'IA. Ne commiter que sur
  demande explicite. (La connexion Lovable a été retirée — tout se gère ici.)
- **Cycle de vie de ce fichier** : quand une phase est terminée et vérifiée, **la supprimer
  de TASK.md** et mettre à jour « État actuel ». Les décisions prises en cours de route
  s'ajoutent dans les tableaux « Choix ».
- **Actions humaines** : les tâches marquées 🧍 nécessitent le prestataire (compte à créer,
  paiement, choix client) — l'IA prépare tout le reste et documente ce qui est attendu.

## Prochaine action

> **Reprendre ici.** Mettre à jour ce bloc à chaque session (2 lignes max).

- **▶ PROCHAINE TÂCHE : 4B.4 — Vue calendrier admin** (`/admin/calendrier`, dernier bloc de
  Phase 4) : vue mensuelle par équipement des périodes réservées (dérivée des `orders`
  confirmés) + action « bloquer ces dates » depuis une demande (crée une commande). Le
  composant `ui/calendar` existe déjà ; s'inspirer du calendrier public de `ContactPage`
  (⚠️ `classNames.root: "relative"` obligatoire). Après 4B.4 → Phase 4 close, passer à la
  Phase 5 (hébergement, 🧍 domaine + accès serveur).
- **Session 2026-07-11 commitée sur `develop`** : `4a8f80c` (gros lot : rôles simplifiés,
  CRUD catégories + photos, ImageKit, page maintenance, téléphone 100 % BD,
  `customers`+`orders`, pages publiques de catégories, demandes 4B.3, code équipement ;
  migrations `0001`→`0004`) puis `5499baa` (fix calendrier contact). **⚠️ Pas encore
  poussé** — attend 🧍 les droits GitHub pour `yvesbat`. `image.png` (maquette) non suivi.
  **Après un checkout neuf : `npm run db:setup`** (migrations + seed pas auto au boot —
  dette Phase 5).
- **État Phase 4** : 4B.1 (auth) · 4B.2 (catalogue) · 4B.3 (demandes) · 4B.6 (thème) **faits
  et vérifiés** ; restent 4B.4 et 4B.5.
- **🧍 En attente client** : compte SMTP (courriels de demandes), domaine (Phase 5),
  validation contenu/photos réelles (Phase 6).

## État actuel

- Site vitrine bilingue FR/EN fonctionnel en développement (TanStack Start / React 19, SSR,
  Tailwind 4) : 5 pages × 2 langues, sélecteur de langue, redirections 301, meta/OG traduits,
  sitemap XML. Textes centralisés dans `src/web/src/lib/i18n.ts` (dictionnaires fr/en typés).
- **Aucune donnée métier statique affichée (Phase 2 close, 2026-07-11)** : catégories,
  équipements et options du formulaire viennent de la BD (loaders → `getCatalogFn`, cache
  60 s invalidé à chaque écriture admin — vérifié : renommer une catégorie dans l'admin
  change l'accueil et la page Équipements immédiatement). `i18n.ts` ne garde que les
  libellés d'interface (les blocs `categories`/`sections`/`equipmentOptions` morts ont été
  supprimés, 691 → 522 lignes). ⚠️ Changement de texte : le titre de l'accueil
  « Trois catégories » → « **Nos catégories** » / « Our categories » (l'ancien supposait un
  nombre fixe) — surchargeable dans Pages. `catalog.ts` ne sert **que de seed**.
- **Page de maintenance si BD indisponible (2026-07-11, demande client interne)** : plus
  aucun repli statique — si la BD est injoignable, les server functions publiques jettent
  `SERVICE_UNAVAILABLE`, le site affiche une page de maintenance bilingue (bouton
  « Réessayer » = rechargement complet) et `src/server.ts` requalifie la réponse SSR en
  **503 + `Retry-After: 30`** (correct pour les moteurs de recherche). `connect_timeout: 5`
  sur le client postgres pour basculer vite. L'absence de la *ligne* `theme` en BD reste un
  cas normal (thème par défaut) — seule la connexion en échec déclenche la maintenance.
  Vérifié en Docker : 200 → arrêt db → 503/maintenance FR+EN en ~20 ms → redémarrage db →
  200 ; « Réessayer » recharge le site complet.
- **Téléphone 100 % BD (2026-07-11)** : plus aucun numéro en dur dans `i18n.ts` ni
  `site.ts` (constantes `PHONE_DISPLAY`/`PHONE_HREF`/`EMAIL` supprimées). Les meta
  descriptions utilisent un gabarit `{phone}` résolu par `pageHead(key, lang, phone)` ;
  les 4 routes concernées (accueil + contact, FR/EN) chargent `contact` dans leur loader
  (⚠️ les `matches` du contexte `head` n'exposent PAS `loaderData` dans cette version de
  TanStack Router — seul le `loaderData` de la route elle-même est disponible). Le message
  de confirmation du formulaire interpole aussi `{phone}`. Unique occurrence en dur
  restante : `DEFAULT_CONTACT` (`lib/contact.ts`) = valeur initiale tant que la ligne
  `settings.contact` n'existe pas. Vérifié en Docker : changer le téléphone dans l'admin
  change les meta des 4 pages.
- **Demandes de réservation (4B.3 fait, 2026-07-11)** : le formulaire public enregistre en
  BD (`reservation_requests`) avec calendrier de disponibilité (journées des commandes
  confirmées grisées), honeypot, rate limit et revalidation serveur ; **courriel de
  notification à l'administrateur** (nodemailer, `SMTP_*` en env, best-effort — non
  configuré = log seulement). Dans l'admin : page **Demandes** (statuts, trace) et
  « Valider → commande » (client trouvé/créé par téléphone, commande liée
  `orders.request_id`, demande `traitee`) → la disponibilité publique s'ajuste aussitôt.
  Vérifié en Docker bout en bout (soumission → validation → journée grisée au public ;
  rate limit au 6ᵉ envoi ; conflit refusé).
- Dépôt restructuré : app web dans `src/web/`, dossiers `infra/` et `scripts/` créés,
  scripts npm proxy à la racine (`npm run dev|build|lint`).
- **Docker opérationnel (Phase 1 faite)** : `infra/docker/web.Dockerfile` (multi-étapes,
  non-root), compose base + overlay dev, healthcheck sur `/fr`, `.env.example` créé,
  `site.ts` lit `VITE_BASE_URL`. Vérifié : FR/EN 200, 301, sitemap, conteneur healthy.
- **Lovable retiré** : `vite.config.ts` est une config standard (tanstackStart + nitro
  `node-server` explicite + react + tailwind + tsconfig-paths, port 8080) ; le wrapper
  d'erreurs SSR (`src/server.ts`, `error-capture`, `error-page`) est conservé.
- **BD opérationnelle (4A)** : monorepo npm workspaces, paquet `@prestige/database`
  (Drizzle, migrations dans `src/database/migrations/`, `seed.ts` idempotent), service `db`
  dans compose, `npm run db:setup` (migrate + seed). Le site public lit la BD via server
  functions (cache 60 s) ; BD injoignable → **page de maintenance 503** (aucun repli statique).
- **Admin `/admin` complet pour le contenu (4B.1, 4B.2, 4B.6 faits)** — navigation :
  Tableau de bord · Équipements (CRUD, statut, featured, publié, ordre, photo) ·
  Catégories (création, renommage FR/EN, ordre, suppression si vide, photo —
  **toutes** les catégories de la BD s'affichent sur le site, même vides : la BD est la
  source de vérité, décision 2026-07-11) · **Pages**
  (textes FR/EN de chaque page éditables par
  surcharges — clé `page_content` de `settings`, liste blanche de chemins dans
  `lib/content.ts`, fusion dans `useT()`, « Texte d'origine » par champ ; l'onglet Contact
  porte aussi les **coordonnées de l'entreprise** — téléphone/courriel en BD, servis partout
  via le loader racine + `useContact()`, composant `admin/ContactSettings`) · Calendrier
  (désactivé, 4B.4) · **Paramètres** (onglet Apparence : curseurs + préréglages
  Or/Vert/Rouge/Bleu + reset, publié en SSR) · **Employés & rôles** (rôle `admin` :
  matrice des rôles, comptes, activation, reset mot de passe) · Mon compte.
  Auth conforme à la spec (sessions hachées, rôles, anti-brute-force).
- **Rôles simplifiés (2026-07-11)** : `superadmin` fusionné dans `admin` (migration
  `0001` — enum `user_role` = `admin` | `accountant`). `admin` = plein accès, y compris
  les comptes employés ; `accountant` = lecture seule (rapports, 4B.5).
- **Pages publiques de catégories (2026-07-11)** : routes dynamiques
  `/fr/equipements/$slug` et `/en/equipment/$slug` (`components/pages/CategoryPage`,
  slug partagé entre les langues, 404 si inconnu). La page liste les **équipements de la
  catégorie** en cartes (photo de l'équipement, sinon photo de la catégorie, sinon image
  neutre ; nom, détail, statut) avec le bouton « **Vérifier la disponibilité** » (→ contact)
  **sur chaque équipement**. Les boutons de la page Équipements et des cartes de l'accueil
  mènent maintenant à ces pages (libellé = `cta` de la catégorie, éditable dans l'admin).
  Sélecteur de langue mappé slug→slug ; hreflang ; catégories ajoutées au sitemap
  dynamiquement (BD, repli silencieux si indisponible).
- **Commandes & clients (2026-07-11, migration `0002`)** : tables `customers` (sans
  connexion — activable plus tard) et `orders` ; page `/admin/commandes` (création avec
  client inline ou existant, aide « Déjà réservé : … », modification des dates, annulation/
  réactivation — pas de suppression) ; garde serveur anti-chevauchement entre commandes
  confirmées d'un même équipement (testée en Docker : création, conflit refusé, extension,
  annulation → dates libérées → re-réservation OK, réactivation en conflit refusée).
  La disponibilité d'un équipement = absence de commande confirmée sur la période.
  Compteur « Locations en cours » sur le tableau de bord. Voir le schéma détaillé
  (« customers et orders — avancés depuis la Phase 8 »).
- **Accueil : diaporama** — 3 photos (`hero-slide-2/3/4.webp`, fondus alpha incrustés +
  désaturation -20 %), rotation auto 10 s (setTimeout ré-armé par diapo), fondu 2 s, points
  de navigation. `hero-excavator.jpg` supprimé ; la page À propos utilise
  `hero-excavator3.jpg`. Le panneau de réglage du thème sur le site public n'apparaît que si
  `VITE_THEME_TWEAKER=1` (tests) — sinon le thème ne se gère que dans l'admin.
- Loader racine = `{ theme, contact, content }` (3 lectures BD en cache 60 s ; échec BD →
  page de maintenance).
- **ImageKit opérationnel (Phase 3 faite, 2026-07-11)** : compte `kiwanoinc`, dossier racine
  `prestigelocations/` (sous-dossiers `categories/` et `equipements/`). Upload depuis
  l'admin (fiche catégorie et fiche équipement) : signature serveur HMAC (10 min, sans SDK
  — `server/impl/imagekit.ts`), envoi direct navigateur → CDN, `image_key` (filePath) en BD
  à l'enregistrement ; remplacement/retrait/suppression → l'ancien fichier est purgé du
  compte (best-effort, **non bloquant avec réessais à 0/5/20 s** : l'index de recherche
  ImageKit accuse quelques secondes de retard sur les uploads — découvert en testant
  l'image Docker, invisible en dev). Affichage : `lib/images.ts` (`imageUrl` + `tr:w,f-auto,q-auto`) et
  `<CdnImage>` (srcset 1x/2x) avec **repli sur les assets bundlés** si pas de clé ou pas
  d'endpoint. Le `.env` racine est lu par `vite.config.ts` (`envDir` + hydratation
  `process.env` en dev). **Les 3 photos de catégories sont hébergées sur ImageKit**
  (noms stables `categories/cat-<slug>.jpg`, référencées dans `catalog.ts` → un seed
  neuf les retrouve ; le seed ne touche jamais `image_key` des lignes existantes) et
  gérables depuis la fiche catégorie de l'admin ; les assets bundlés restent en repli. Photos d'équipements : stockées et affichées dans l'admin ; le
  site public n'affiche pour l'instant que les photos de **catégories** (pas de page détail
  équipement). Vérifié bout en bout (upload réel → SSR CDN → retrait → fichier purgé).
- Un seul compte employé existe (dev : admin@prestige.local / prestige-dev, admin).
  Gestion des employés **complète (4B.1 fait)** : garde « dernier admin actif »
  côté serveur, pas d'auto-désactivation, message clair sur courriel en double, colonne
  « Dernière connexion », erreurs serveur affichées dans l'UI (vérifié en navigateur le
  2026-07-11).
- ⚠️ Piège à connaître : les fichiers `src/web/src/server/*.ts` sont des wrappers
  client-safe — **tout code serveur (BD, cookies) doit passer par un import dynamique dans
  le handler** (voir `src/server/impl/*`), sinon la protection d'imports casse le client.
- ⚠️ Reste à automatiser : les migrations/seed ne tournent pas encore au démarrage du
  conteneur (fait à la main via `npm run db:setup`) — à régler en Phase 5.

## Structure du dépôt

```
Projet-Prestige_Locations/
├── infra/                      # Déploiement
│   ├── docker/
│   │   └── web.Dockerfile      # ✔ Build multi-étapes de l'app web
│   ├── docker-compose.yml      # ✔ Base commune (web ; db en Phase 4 — aucun port publié)
│   ├── docker-compose.dev.yml  # ✔ Overlay dev (publie :3000 ; :5432 en Phase 4)
│   ├── docker-compose.prod.yml # Overlay prod (Caddy/TLS, restart, logs) — Phase 5
│   └── README.md               # Procédures de déploiement — Phase 5
├── scripts/                    # Scripts d'exploitation (à remplir en Phase 5)
│   ├── setup.sh                # Prépare le serveur (vérifie Docker, pare-feu, user deploy)
│   ├── deploy.sh               # Build + push + redéploiement (compose up -d)
│   ├── rollback.sh             # Retour à l'image précédente
│   ├── logs.sh                 # Suivi des logs du service web
│   └── backup.sh               # Sauvegarde (config, volumes, pg_dump)
├── src/
│   ├── web/                    # Application web (TanStack Start) : site public + /admin
│   └── database/               # ✔ BD : schéma Drizzle, migrations, seed
├── package.json                # Scripts proxy (dev/build/lint → src/web)
├── PROJET.md                   # Cadrage client (gelé)
└── TASK.md
```

## Ordre d'exécution

```
Phase 4 (BD + Admin) ──> Phase 5 (Hébergement) ──> Phase 6 (Démo)
                                                       │
                                Phase 7 (Production) <─┘
                                Phase 8 (Partenariat, continu)
```

*(Phases 1 — Docker, 2 — Catalogue et 3 — ImageKit : terminées.)* Les suivantes sont
séquentielles.

## Environnements et configuration (.env)

Deux environnements : **dev** (poste de travail) et **prod** (serveur). Mêmes noms de
variables partout — seules les **valeurs** changent, portées par le `.env` de chaque
machine (racine du dépôt en dev, `/srv/prestige/.env` sur le serveur).

- **`.env.example`** : commité, exhaustif, valeurs factices + commentaire dev/prod par
  variable — c'est la documentation de référence. Toute nouvelle variable y est ajoutée
  **dans la même PR**.
- **`.env`** : jamais commité (déjà dans `.gitignore`) ; copié de `.env.example` (en prod :
  `scripts/setup.sh` s'en charge).
- **Variables `VITE_*`** : bakées dans le bundle **au build** (passées en `build.args` dans
  compose) — publiques par nature, jamais de secret en `VITE_*`. Les autres variables sont
  lues au démarrage du conteneur (runtime).

### Compose : base + overlays

| Fichier | Rôle |
|---|---|
| `infra/docker-compose.yml` | **Base commune** : services `web` et `db`, réseau interne, healthchecks — **aucun port publié** |
| `infra/docker-compose.dev.yml` | Overlay **dev** : publie `web` :3000 et `db` :5432 (pour `npm run dev` contre la BD) |
| `infra/docker-compose.prod.yml` | Overlay **prod** : ajoute Caddy (80/443, TLS), `restart: always`, limites de logs — `web` et `db` restent internes |

Commandes canoniques (depuis la racine ; les scripts de `scripts/` les encapsulent) :

```sh
# dev — stack complète en conteneurs
docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up
# dev — quotidien : BD seule en conteneur + npm run dev (hot reload) en local
docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up -d db
npm run dev
# prod (sur le serveur)
docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d
```

### Variables par environnement

| Variable | Type | Consommée par | Dev | Prod | Phase |
|---|---|---|---|---|---|
| `VITE_BASE_URL` | build arg (public) | `site.ts` (hreflang, sitemap) | `""` (fallback) | `https://<domaine>` | 1 |
| `VITE_THEME_TWEAKER` | build arg (public) | panneau de réglage du thème sur le site (tests) | vide (masqué) ; `1` pour tester | vide | 4 |
| `VITE_IMAGEKIT_URL_ENDPOINT` | build arg (public) | `images.ts` (URLs CDN) | URL du compte (vide → assets locaux) | URL du compte | 3 ✔ |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_FOLDER` | runtime (secret) | signature d'upload, suppression de fichiers | clés du compte, dossier `prestigelocations` | mêmes valeurs | 3 ✔ |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | runtime (secret) | service `db` | valeurs simples | mot de passe fort généré | 4 |
| `DATABASE_URL` | runtime (secret) | `web` (Drizzle) et `npm run dev` | `postgres://…@localhost:5432/…` | `postgres://…@db:5432/…` | 4 |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | runtime (secret) | `seed.ts` (admin initial) | compte de test | vraies valeurs du gérant | 4 |
| `DOMAIN` | runtime (public) | Caddy | inutilisé | domaine final | 5 |

> Nuance `DATABASE_URL` : hôte `localhost` quand l'app tourne hors conteneur
> (`npm run dev`), hôte `db` quand elle tourne dans compose. Le `.env.example` documente
> les deux formes.

---

## Informations client

- **Fondateurs** : Mathis Jeanbrun et Alexane Lefebvre.
- **Adresse de la compagnie** : 71B rue Koak, Wolinak (Québec) G0X 1B0.
- ⚠️ **Incohérence à clarifier avec le client (Phase 6)** : le site affiche partout
  « Sherbrooke, Québec — service dans toute la région », mais l'adresse de la compagnie est
  à **Wolinak** (près de Bécancour, ~1 h de Sherbrooke). Confirmer la zone de service
  affichée, et si l'adresse postale doit apparaître sur le site (pied de page / page
  contact / fiche Google Business).

## Domaine métier

Ce que la plateforme manipule. Aujourd'hui ces données vivent en dur dans les dictionnaires
de traduction (`src/web/src/lib/i18n.ts`) — la Phase 2 les centralise dans un **catalogue
typé**, futur schéma de la base de données.

### Ce qui est loué

Des **équipements** appartenant à une **catégorie**, loués selon une **formule** (durée),
avec **livraison optionnelle**. Un client fait une **demande de réservation** (pas encore de
réservation confirmée en ligne — elle se conclut par téléphone/courriel avec le gérant).

### Acteurs

| Acteur | Compte | Accès |
|---|---|---|
| **Client** (`customers`) | **Table en place (2026-07-11), sans connexion** — fiches créées par les employés pour compléter une commande ; aucune colonne d'auth (une migration ajoutera `password_hash`/`active` si l'option connexion s'active un jour) | Site public uniquement ; demande de réservation via le formulaire de contact |
| **Employé** (`users`) | Oui — rôles `admin`, `accountant` (`superadmin` fusionné dans `admin` le 2026-07-11) | Tableau d'administration `/admin` (Phase 4) |

Permissions des employés au lancement :

| Rôle | Catalogue (CRUD + photos) | Demandes de réservation | Comptes employés | Vocation future |
|---|---|---|---|---|
| `admin` | ✓ | ✓ (traiter, statuer) | ✓ (création, rôle, désactivation) | Tout ; réservations confirmées (Phase 8) |
| `accountant` | lecture seule | lecture + **rapports** | — | Finances (Phase 8) |

### Demandes de réservation

Le formulaire public **enregistre chaque demande en BD** (soumission côté serveur — le
`mailto:` actuel ne laisse aucune trace et sera remplacé). Les employés les consultent et
les traitent dans `/admin`, et un **rapport/analyse** est disponible : volume par période,
répartition par équipement et par catégorie, statuts. Pas de courriel sortant au
lancement : le gérant consulte `/admin` (notifications à revoir en Phase 8).

### Disponibilités (calendrier)

Chaque équipement a un **calendrier d'indisponibilités** tenu par les employés dans
`/admin` : périodes déjà louées, en maintenance, ou bloquées. Côté public, le formulaire de
demande propose un **choix de dates** qui grise les journées indisponibles de l'équipement
sélectionné. Règles :

- Une **demande ne bloque pas le calendrier** — seul un employé bloque des dates (d'un clic
  depuis une demande acceptée, ou manuellement). La confirmation reste humaine.
- Granularité **à la journée** (pas d'heures), périodes inclusives.
- Le calendrier suppose **une unité par équipement** (réalité actuelle du parc) ; si un
  équipement existe en plusieurs exemplaires un jour, on ajoutera une quantité en Phase 8.

### Catégories (3 au lancement — extensibles via l'admin)

Le nombre de catégories n'est pas fixe : l'admin permet d'en créer (slug généré du nom FR,
position en fin de liste) et d'en supprimer (seulement si vides d'équipements — FK
`on delete restrict`). **Toutes les catégories de la BD s'affichent sur le site public**,
y compris sans équipement publié (décision 2026-07-11 — la BD est la source de vérité ;
l'ancien filtre « catégorie vide masquée » a été retiré). La photo d'une catégorie se
téléverse depuis sa fiche dans l'admin (ImageKit) ; sans photo téléversée, une catégorie
affiche une **image neutre** (`BLANK_IMAGE`, SVG sombre inline dans `lib/images.ts`) —
jamais la photo d'une autre catégorie (2026-07-11). Les assets bundlés `cat-*.jpg` ne
servent plus que de repli aux 3 slugs d'origine.

| Slug | FR | EN |
|---|---|---|
| `machinerie` | Machinerie | Machinery |
| `remorques` | Remorques | Trailers |
| `petits-equipements` | Petits équipements | Small equipment |

### Équipements (catalogue actuel)

| Slug | Code | Catégorie | FR / EN | Statut |
|---|---|---|---|---|
| `mini-pelle` | MP-01 | machinerie | Mini-pelle (excavatrice compacte) / Mini excavator | disponible |
| `tracteur-compact` | TC-01 | machinerie | Tracteur compact avec accessoires / Compact tractor | disponible |
| `plateforme-elevatrice` | PE-01 | machinerie | Plateforme élévatrice / Aerial lift | **bientôt** |
| `godets-accessoires` | GA-01 | machinerie | Godets et accessoires variés / Buckets & attachments | disponible |
| `trailer-dompeur` | TD-01 | remorques | Trailer dompeur / Dump trailer | disponible |
| `trailer-ferme` | TF-01 | remorques | Trailer fermé / Enclosed trailer | disponible |
| `trailer-plateforme` | TP-01 | remorques | Trailer plateforme / Flatbed trailer | disponible |
| `attaches-remorquage` | AR-01 | remorques | Attaches et accessoires / Hitches & accessories | disponible |
| `compacteur` | CP-01 | petits-equipements | Compacteur à plaque vibrante / Plate compactor | disponible |
| `scie-a-beton` | SB-01 | petits-equipements | Scie à béton / Concrete saw | disponible |
| `marteau-piqueur` | MA-01 | petits-equipements | Marteau-piqueur / Jackhammer | disponible |
| `outillage-specialise` | OS-01 | petits-equipements | Outillage spécialisé sur demande / Specialized tools | sur demande |

### Attributs d'un équipement (modèle cible)

`slug` (id stable), `code` (optionnel, unique — ex. « MP-01 », distingue deux unités du
même nom, affiché entre parenthèses partout où le nom apparaît : admin, commandes,
formulaire de contact, pages publiques ; migration `0004`, 2026-07-11), `category`,
`name` {fr, en}, `description` {fr, en},
`status` (`disponible` | `bientot` | `sur-demande`), `image` (clé ImageKit),
`featured` (mis en avant sur l'accueil). Plus tard (réservation sur plateforme) :
`tarifs` {jour, semaine, mois}, `quantite`, `disponibilites`.

### Formules de location

`journee`, `semaine`, `mois` + option `livraison` (région de Sherbrooke).
**Tarifs non publiés sur le site pour l'instant** (communiqués par le gérant) — 🧍 à
confirmer avec le client si des prix seront affichés un jour.

### Composants UI

| Composant | Rôle | Consomme |
|---|---|---|
| `site/Header` | Navigation, sélecteur FR/EN, CTA Réserver | i18n |
| `site/Footer` | Nav, services, contact, réseaux sociaux | i18n |
| `site/SectionTitle` | Titre de section (eyebrow/titre/sous-titre) | props |
| `site/CtaSection` | Bandeau d'appel à l'action réutilisé partout | i18n |
| `home/Hero` | Héro de l'accueil (slogan, CTA, téléphone) | i18n |
| `home/FeatureBar` | 4 arguments clés | i18n |
| `home/CategoriesSection` | Grille des 3 catégories | i18n → **catalogue** |
| `home/CategoryCard` | Carte d'une catégorie | props → **catalogue** |
| `pages/HomePage…ContactPage` | Corps des 5 pages (partagés FR/EN) | i18n → **catalogue** |
| `<CdnImage>` ✔ | Image ImageKit (srcset 1x/2x) avec repli sur asset bundlé | catalogue |
| `admin/LoginPage` *(à créer, Phase 4)* | Connexion des employés | BD (users) |
| `admin/EquipmentList` *(à créer, Phase 4)* | Liste + statuts des équipements | BD |
| `admin/EquipmentForm` *(à créer, Phase 4)* | Ajout/édition (FR+EN, statut, photo) | BD + ImageKit |
| `admin/UserList` / `UserForm` *(à créer, Phase 4)* | Comptes employés (admin) | BD (users) |
| `admin/RequestList` *(à créer, Phase 4)* | Demandes de réservation (filtres, statuts) | BD (reservation_requests) |
| `admin/AvailabilityCalendar` *(à créer, Phase 4)* | Indisponibilités par équipement | BD (equipment_unavailabilities) |
| `AvailabilityPicker` *(à créer, Phase 4)* | Choix de dates du formulaire public (jours grisés) | BD via `getUnavailableDates` |
| `admin/Reports` *(à créer, Phase 4)* | Rapports/analyse des demandes, export CSV | BD (reservation_requests) |
| `admin/ThemeSettings` *(à créer, Phase 4)* | Thème du site : curseurs + préréglages + reset | BD (settings) |
| `dev/ThemeTweaker` ✔ | Panneau de réglage local (dev uniquement) | variables CSS |
| `ui/*` | Bibliothèque shadcn/ui (boutons, formulaires…) | — |

---

## Phase 4 — Base de données et tableau d'administration

**Objectif** : le gérant peut **ajouter, modifier et téléverser des produits** lui-même,
sans redéploiement. Le site public lit le catalogue depuis la BD.

**Dépendances** : Phase 2 (types + seed) et Phase 3 (upload de photos) — faites ; le
compose de la Phase 1 (faite) reçoit le service `db`. C'est la phase la plus lourde — exécuter dans l'ordre
**4A (BD) → 4B.1 (auth) → 4B.2 (catalogue) → 4B.3 (demandes) → 4B.4 (calendrier) →
4B.5 (rapports)** ; chaque bloc a son propre critère de complétion et peut être une PR.
**Estimation** : 4A ≈ 1–1,5 j ; 4B ≈ 3–4 j.

### Arborescence cible (indicative — suivre les conventions TanStack Start du projet)

```
src/database/                    # paquet @prestige/database (workspace)
├── package.json
├── drizzle.config.ts
├── schema/index.ts              # tables + enums (voir schéma détaillé)
├── migrations/                  # générées par drizzle-kit
└── seed.ts

src/web/src/
├── lib/
│   ├── db.ts                    # client Drizzle (une instance, import du schéma)
│   ├── auth.ts                  # hash/verify, sessions, requireUser(role) pour les gardes
│   ├── catalog-server.ts        # getCatalog() + cache 60 s + invalidate()
│   └── rate-limit.ts            # compteurs en mémoire (login, formulaire public)
├── server/                      # server functions (une par domaine)
│   ├── auth.ts  public.ts  equipments.ts  categories.ts
│   ├── requests.ts  unavailabilities.ts  users.ts  reports.ts
├── components/admin/            # tableaux, formulaires, upload, calendrier
└── routes/admin/                # voir navigation ci-dessous
```

### Navigation de l'admin

Layout `/admin` : barre latérale (repliée en menu sur mobile) — **Tableau de bord,
Équipements, Catégories, Demandes, Calendrier, Rapports, Employés** (rôle admin),
**Mon compte**, Se déconnecter.

| Route | Page | Contenu |
|---|---|---|
| `/admin/login` | Connexion | Hors layout protégé |
| `/admin` | Tableau de bord | Compteurs : demandes `nouvelle`, équipements publiés, prochaines indisponibilités |
| `/admin/equipements` (+ `/nouveau`, `/$id`) | Équipements | Liste (catégorie, statut, photo, publié) + formulaire |
| `/admin/categories` | Catégories | ✔ Création, renommage FR/EN, ordre, suppression (si vide) |
| `/admin/demandes` | Demandes | Liste filtrable, changement de statut, action « bloquer ces dates » |
| `/admin/commandes` | Commandes | ✔ Locations confirmées : client + équipement + période (création avec client inline, modification des dates, annulation/réactivation, garde anti-chevauchement serveur) |
| `/admin/calendrier` | Calendrier | Vue mensuelle des périodes réservées (dérivée des commandes) |
| `/admin/rapports` | Rapports | Compteurs par période, répartition, export CSV |
| `/admin/parametres` | Paramètres | ✔ Onglet Apparence : thème (curseurs, préréglages Or/Vert/Rouge/Bleu, aperçu, enregistrer/réinitialiser) ; autres réglages à venir |
| `/admin/pages` | Pages | ✔ Textes FR/EN de chaque page par onglets (Accueil, Services, À propos, Contact, Sections communes), surcharges + retour au texte d'origine ; l'onglet Contact inclut les coordonnées de l'entreprise (téléphone/courriel, servis sur tout le site) |
| `/admin/employes` | Employés & rôles | ✔ admin : matrice des rôles, création, rôle, activation, reset mot de passe |
| `/admin/mon-compte` | Mon compte | Changement de son mot de passe |

### Contrats des server functions

Validation `zod` sur toutes les entrées ; les fonctions « admin+ » exigent une session
valide et le rôle indiqué (voir matrice « Acteurs »).

| Fonction | Accès | Entrée → Sortie | Notes |
|---|---|---|---|
| `getCatalog()` | public | — → `{categories[], equipments[]}` (publiés seulement) | cache 60 s |
| `getUnavailableDates(slug, months)` | public | slug + fenêtre → `date[]` | jamais les raisons/notes |
| `submitReservationRequest(payload)` | public | nom, téléphone, equipmentSlug?, dates?, message, lang → `{ok}` | honeypot, rate limit IP, revalidation chevauchement |
| `login(email, password)` / `logout()` | public / session | → session cookie / suppression | anti-brute-force |
| `changeMyPassword(old, new)` | session | → `{ok}` | min. 10 caractères |
| `list/create/update/deleteEquipment`, `reorderEquipments` | admin+ | CRUD complet → entité | invalide le cache catalogue ; delete = confirmation + suppression image ImageKit |
| `create/update/deleteCategory`, `reorderCategories` | admin | → entité | invalide le cache ; delete refusé si la catégorie a des équipements |
| `listRequests(filters)`, `updateRequestStatus(id, status)` | admin+ (`accountant` : lecture) | → liste paginée / entité | trace `handled_by`/`handled_at` |
| `list/create/deleteUnavailability` | admin+ | equipmentId, dates, raison, note → entité | `create` accepte `request_id` (action « bloquer ces dates ») |
| `list/create/updateUser`, `resetUserPassword` | admin | → entité | jamais de suppression, `active` seulement ; garde « dernier admin actif » |
| `getReport(period)`, `exportRequestsCsv(period)` | accountant+ | → agrégats / CSV | volume, répartition équipement/catégorie |
| `getImageKitSignature()` | admin+ | → `{signature, token, expire}` | la clé privée reste serveur |
| `getTheme()` | public | — → config thème (ou défaut) | injectée en variables CSS au SSR (root), cache 60 s |
| `updateTheme(config)` / `resetTheme()` | admin+ | config zod-validée → `{ok}` | reset = suppression de la ligne `settings.theme` ; invalide le cache |

### Choix

| Choix | Décision | Justification |
|---|---|---|
| BD | PostgreSQL 16 (image `postgres:16-alpine`) | Standard, robuste, prêt pour les réservations (Phase 8) |
| ORM / migrations | **Drizzle ORM + drizzle-kit** | TS-first, léger, migrations SQL lisibles ; plus simple que Prisma dans un conteneur |
| Driver | `postgres` (postgres.js) | Recommandé par Drizzle, sans binaire natif |
| Organisation | **npm workspaces** à la racine (`"workspaces": ["src/*"]`) ; `src/database` devient le paquet `@prestige/database` (schéma + migrations + seed) importé par `src/web` | Import propre du schéma des deux côtés ; évite les alias tsconfig fragiles |
| Lecture côté site public | Server functions TanStack Start (`createServerFn`) + cache mémoire 60 s | SSR sans toucher la BD à chaque requête ; invalidation simple depuis l'admin |
| Auth | **Maison, minimale** : table `users` (employés uniquement — pas de comptes clients), hachage `bcryptjs`, table `sessions` (token opaque, expiration 7 j), cookie httpOnly/secure/sameSite=lax, garde serveur sur toutes les routes `/admin/*` et server functions admin, **vérification du rôle** selon la matrice de permissions | Quelques employés seulement : une lib d'auth complète est surdimensionnée ; le flux est simple à auditer |
| Formulaires admin | `react-hook-form` + `zod` (déjà dans les deps) + composants shadcn/ui existants | Zéro dépendance nouvelle côté UI |
| Calendriers | `react-day-picker` (déjà dans les deps, composant shadcn `calendar`) pour le sélecteur public (jours indisponibles grisés) et la vue admin | Zéro dépendance nouvelle ; gère nativement plages et jours désactivés |
| Upload photo | Endpoint serveur qui signe (SDK `imagekit` Node) → upload direct navigateur → ImageKit ; `image_key` stockée en BD | La clé privée ne quitte jamais le serveur |
| Langue de l'admin | Français uniquement, responsive mobile | Le gérant est francophone et sur le terrain |

### Contenu de la base de données (schéma détaillé)

Quatre tables au lancement. Convention : `snake_case`, timestamps `timestamptz` (`created_at`
défaut `now()`, `updated_at` mise à jour par l'application), slugs **immuables** (jamais
renommés — ils servent d'identifiant stable pour le seed et ImageKit).

**Enums** : `equipment_status` = `disponible` | `bientot` | `sur_demande` ;
`user_role` = `admin` | `accountant` ;
`request_status` = `nouvelle` | `en_cours` | `traitee` | `sans_suite` ;
`unavailability_reason` = `loue` | `maintenance` | `autre`.

#### `categories`

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `slug` | text | unique, not null | `machinerie`, `remorques`, `petits-equipements` |
| `name_fr` / `name_en` | text | not null | Nom affiché |
| `description_fr` / `description_en` | text | not null | Paragraphe de la carte (accueil) et de la section (page Équipements) |
| `image_key` | text | null | Clé ImageKit de la photo de catégorie |
| `position` | integer | not null, défaut 0 | Ordre d'affichage |
| `created_at` / `updated_at` | timestamptz | not null | |

#### `equipments`

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `slug` | text | unique, not null | Voir tableau « Domaine métier » |
| `category_id` | integer | FK → categories, **on delete restrict**, not null | Une catégorie ne peut pas être supprimée si elle a des équipements |
| `name_fr` / `name_en` | text | not null | |
| `note_fr` / `note_en` | text | null | Complément court (ex. « idéal pour la terre, la pierre et les débris ») |
| `description_fr` / `description_en` | text | null | Réservé à une future page détail — vide au lancement |
| `status` | equipment_status | not null, défaut `disponible` | `bientot` s'affiche « (bientôt disponible) », `sur_demande` « (sur demande) » |
| `image_key` | text | null | Clé ImageKit de la photo |
| `featured` | boolean | not null, défaut false | Apparaît dans la carte de sa catégorie sur l'accueil |
| `published` | boolean | not null, défaut true | Masquer du site sans supprimer (l'admin liste tout) |
| `position` | integer | not null, défaut 0 | Ordre dans sa catégorie |
| `created_at` / `updated_at` | timestamptz | not null | |

Index : `equipments(category_id)`, `equipments(category_id, position)`.
Politique de suppression : privilégier `published = false` ; la suppression définitive reste
possible dans l'admin (avec confirmation) et supprime aussi l'image ImageKit.

#### `users` — comptes **employés** de la plateforme

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `email` | text | unique, not null | Stocké en minuscules (normalisé par l'app) |
| `password_hash` | text | not null | bcryptjs, coût 12 |
| `name` | text | not null | Nom affiché dans l'admin |
| `role` | user_role | not null, défaut `admin` | Voir matrice de permissions (« Acteurs ») |
| `active` | boolean | not null, défaut true | Désactivation sans suppression (bloque le login) |
| `created_at` / `last_login_at` | timestamptz | / null | |

Les **clients ne sont pas dans `users`** : pas de connexion client pour l'instant. La table
`customers` (nom, téléphone, courriel, notes) arrivera en Phase 8 avec `reservations`.

#### `reservation_requests` — demandes envoyées par le formulaire public

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `name` | text | not null | Nom saisi dans le formulaire |
| `phone` | text | not null | Téléphone saisi (contact principal du gérant) |
| `equipment_id` | integer | FK → equipments, **on delete set null**, null | Équipement choisi ; null si « Autre / plusieurs » ou équipement supprimé depuis |
| `equipment_label` | text | not null | Libellé au moment de la demande (fige l'historique pour les rapports) |
| `start_date` / `end_date` | date | null | Période **souhaitée** par le client (choisie selon les disponibilités affichées) ; null si non précisée |
| `message` | text | null | Durée, détails du projet |
| `lang` | text | not null | `fr` / `en` — langue du visiteur |
| `status` | request_status | not null, défaut `nouvelle` | Cycle : nouvelle → en_cours → traitee / sans_suite |
| `handled_by` | integer | FK → users, null | Employé qui a traité |
| `handled_at` | timestamptz | null | |
| `created_at` / `updated_at` | timestamptz | not null | |

Index : `reservation_requests(status)`, `reservation_requests(created_at)`.
Le formulaire public écrit via une server function (validation zod, honeypot anti-spam,
limite de débit par IP) — **aucune authentification requise** pour soumettre.

#### `equipment_unavailabilities` — calendrier des indisponibilités

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `equipment_id` | integer | FK → equipments, on delete cascade, not null | |
| `start_date` / `end_date` | date | not null, check `end_date >= start_date` | Période inclusive, à la journée |
| `reason` | unavailability_reason | not null, défaut `loue` | Affichage admin ; le public voit juste « indisponible » |
| `note` | text | null | Ex. nom du client, chantier |
| `request_id` | integer | FK → reservation_requests, on delete set null, null | Renseigné quand le blocage vient d'une demande acceptée |
| `created_by` | integer | FK → users, null | Employé qui a bloqué |
| `created_at` | timestamptz | not null | |

Index : `equipment_unavailabilities(equipment_id, start_date, end_date)`.
Lecture publique : server function `getUnavailableDates(equipmentSlug, fromMonth)` qui ne
renvoie **que les dates** (jamais les raisons/notes).

#### `settings` — réglages de la plateforme (dont le thème)

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `key` | text | PK | Ex. `theme` |
| `value` | jsonb | not null | Pour `theme` : `{bgL, surfaceL, cardL, accentL, borderL, warmth, hue, goldL, goldC, goldH}` |
| `updated_at` / `updated_by` | timestamptz / FK → users, null | | Traçabilité |

Pas de seed : en l'absence de ligne `theme`, le site utilise le **thème par défaut**
codé en dur (constante `DEFAULT_THEME` — les valeurs actuelles de `styles.css`, validées
le 2026-07-10). « Réinitialiser » dans l'admin supprime la ligne (retour au défaut).

#### `sessions`

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `token_hash` | text | PK | SHA-256 du token opaque (le token en clair ne vit que dans le cookie) |
| `user_id` | integer | FK → users, on delete cascade, not null | |
| `expires_at` | timestamptz | not null | 7 jours glissants ; purge des expirées au login |
| `created_at` | timestamptz | not null | |
| `ip` / `user_agent` | text | null | Trace de connexion (débogage) |

#### Contenu du seed

- Les **3 catégories** et **12 équipements** du « Domaine métier », textes repris mot pour
  mot du site actuel ; `position` = ordre des tableaux.
- `featured = true` pour les 9 équipements visibles sur les cartes de l'accueil :
  `mini-pelle`, `tracteur-compact`, `plateforme-elevatrice`, `trailer-dompeur`,
  `trailer-ferme`, `trailer-plateforme`, `compacteur`, `scie-a-beton`, `marteau-piqueur`
  (les 3 restants : `featured = false`).
- `plateforme-elevatrice` → `status = bientot` ; `outillage-specialise` → `sur_demande` ;
  le libellé « (bientôt disponible) » est **dérivé du statut**, pas stocké en note.
- **1 employé `admin`** créé depuis `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  (env) au premier seed ; jamais écrasé s'il existe. Les autres comptes employés se créent
  ensuite via l'admin (rôle admin uniquement).
- Seed **idempotent** : upsert par `slug` (met à jour les textes, préserve `image_key`,
  `published` et `position` modifiés via l'admin).

#### `customers` et `orders` — avancés depuis la Phase 8 (migration `0002`, 2026-07-11)

- **`customers`** : `id`, `name` (not null), `phone` (not null), `email` (null), `note`
  (null), timestamps. Créés par les employés pour compléter une commande — **aucune
  colonne d'auth** ; si la connexion client s'active un jour, une migration ajoutera
  `password_hash`/`active` sans rien casser.
- **`orders`** (« Commandes » dans l'admin) : `customer_id` (FK restrict), `equipment_id`
  (FK restrict), `start_date`/`end_date` (dates inclusives), `status`
  (`order_status` = `confirmee` | `annulee`, défaut `confirmee`), `note`, `created_by`
  (FK users, set null), timestamps. Index `(equipment_id, start_date, end_date)` et
  `(customer_id)`.
- **Règles** : une commande `confirmee` rend l'équipement **indisponible** sur sa période ;
  hors de ces périodes il est disponible pour d'autres clients. Chevauchement interdit
  entre commandes confirmées du même équipement (garde serveur `findOrderConflict`,
  message clair avec la période en conflit — vérifiée aussi à la modification de dates et
  à la réactivation). `annulee` libère les dates ; « terminée » est dérivé de
  `end_date < aujourd'hui`, jamais stocké. Pas de suppression (historique).

#### Prévu pour la Phase 8 (ne pas créer maintenant)

Connexion client optionnelle (colonnes d'auth sur `customers`), colonne `quantite` sur
`equipments` (si un équipement existe en plusieurs exemplaires), colonnes tarifaires
(`price_day`, `price_week`, `price_month`). Le schéma ci-dessus n'a pas besoin de changer
pour les accueillir.

### Démarche — 4A : base de données

1. Passer la racine en npm workspaces ; créer `src/database/package.json`
   (`@prestige/database`), y installer `drizzle-orm`, `postgres`, `drizzle-kit` (dev).
2. Écrire le schéma Drizzle conformément au « Contenu de la base de données » ci-dessus ;
   générer la migration initiale (`drizzle-kit generate`).
3. Ajouter le service `db` à `infra/docker-compose.yml` (volume nommé, healthcheck
   `pg_isready`, env `POSTGRES_*`, aucun port publié) ; publier :5432 dans l'overlay dev ;
   `DATABASE_URL` pour `web`.
4. `seed.ts` : upsert des 3 catégories + 12 équipements depuis `catalog.ts` (idempotent) +
   création de l'`admin` initial (`ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` en env, hash au
   premier run).
5. Basculer la lecture du site public : server function `getCatalog()` (BD + cache 60 s) ;
   `catalog.ts` ne sert plus qu'au seed et aux types.
6. Vérifier : site identique, BD sourcée ; `docker compose up` complet (web + db + seed).

### Authentification des employés (spécification)

- **Connexion** : `/admin/login` — courriel + mot de passe. Succès → session 7 jours
  (cookie httpOnly/secure/sameSite=lax, token opaque haché en BD) et redirection vers
  `/admin`. Échec → message générique (« Identifiants invalides ») sans révéler si le
  courriel existe ; 5 échecs par IP/compte → blocage 15 min.
- **Déconnexion** : action « Se déconnecter » dans l'en-tête de l'admin — supprime la
  session en BD et le cookie.
- **Garde** : layout `/admin/*` vérifie la session **et** `users.active` à chaque requête ;
  sans session valide → redirection `/admin/login`. Les server functions d'écriture
  vérifient en plus le rôle (matrice « Acteurs ») — jamais de contrôle côté client seul.
- **Mot de passe** : l'employé change le sien (page « Mon compte » : ancien + nouveau,
  min. 10 caractères) ; un `admin` peut réinitialiser celui d'un autre employé (défini
  à la main, communiqué hors plateforme). **Pas de « mot de passe oublié » par courriel au
  lancement** (pas d'envoi de courriels sortants) — la réinitialisation passe par un
  admin ; à revoir si le nombre d'employés grandit.
- **Pas d'auto-inscription** : aucun formulaire public de création de compte ; seuls les
  admins créent des comptes. Désactiver un compte (`active = false`) invalide ses
  sessions au prochain contrôle.

### Démarche — 4B : admin

7. Routes : `/admin/login`, layout `/admin` protégé (voir spécification ci-dessus), pages
   liste + formulaire équipement, page catégories, page « Mon compte », pages comptes
   employés (rôle admin).
8. Server functions CRUD (`zod` en validation) + invalidation du cache catalogue.
9. Upload : route serveur `POST /api/imagekit-signature` (session requise) ; composant
   d'upload avec aperçu ; suppression de l'ancienne image ImageKit lors d'un remplacement.
10. **Demandes de réservation** : remplacer le `mailto:` du formulaire public par une server
    function (zod, honeypot, limite de débit) qui insère dans `reservation_requests` +
    écran de confirmation ; dans l'admin : page « Demandes » (liste triée par date, filtres
    statut/équipement/période, changement de statut avec traçage `handled_by`) et page
    « Rapports » (compteurs par période, répartition par équipement/catégorie, export CSV) —
    accessible en lecture au rôle `accountant`.
11. **Calendrier de disponibilités** :
    - admin : page « Calendrier » — sélection d'un équipement, vue mensuelle, ajout/retrait
      de périodes d'indisponibilité (raison, note) ; action « bloquer ces dates » depuis une
      demande acceptée (pré-remplie avec `request_id`, équipement et dates demandées) ;
    - public : dans le formulaire de contact, quand un équipement est choisi, sélecteur de
      plage de dates avec les jours indisponibles grisés (via `getUnavailableDates`) ;
      mention claire « la demande ne constitue pas une réservation confirmée » ; si
      « Autre / plusieurs équipements », champ dates libre sans calendrier ;
    - la server function de soumission **revalide côté serveur** que la plage demandée ne
      chevauche pas une indisponibilité (message d'erreur sinon).
12. Parcours de recette complet (voir « Fait quand »).

### Tâches

**4A — Base de données** *(fait quand : le site public rend le même contenu qu'avant, sourcé
depuis la BD ; `docker compose down -v && up` re-seed proprement)*

- [x] Workspaces + paquet `@prestige/database` (schéma, migration initiale).
- [x] Service `db` dans compose (base + overlay dev :5432) + `DATABASE_URL`.
- [x] `seed.ts` idempotent (catalogue + admin initial).
- [x] Site public lit la BD : `db.ts`, `catalog-server.ts` (cache 60 s), `getCatalog()`.

**4B.1 — Authentification** *(fait quand : la recette « auth » ci-dessous passe)*

- [x] `lib/auth.ts` (hash, sessions, `requireUser(role)`) + `lib/rate-limit.ts`.
- [x] `/admin/login`, layout protégé, déconnexion, « Mon compte » (changement de mot de
      passe), conforme à la spécification ci-dessus.
- [x] Comptes employés (`/admin/employes`, rôle admin) : création, rôle,
      activation/désactivation, reset mot de passe ; pas de suppression. Gardes serveur :
      dernier admin actif jamais rétrogradé/désactivé, pas d'auto-désactivation,
      courriel en double → message clair ; erreurs `{ok:false, error}` affichées dans l'UI.

**4B.2 — Catalogue dans l'admin** *(fait quand : ajout d'un équipement avec photo visible
côté public sans redéploiement)*

- [x] Tableau de bord `/admin` (compteurs : demandes nouvelles, locations en cours,
      équipements publiés, employés actifs).
- [x] Équipements : liste + formulaire (FR+EN, code, statut, featured, publié, ordre, photo).
- [x] Catégories : création (slug auto), renommage FR/EN, ordre, suppression si vide
      (erreur claire sinon) ; toutes les catégories BD affichées sur le site public.
- [x] Upload photo signé → ImageKit (`getImageKitSignature`), aperçu, remplacement
      (suppression de l'ancienne image), `image_key` en BD — catégories et équipements
      (composant `admin/ImageUpload`).

**4B.3 — Demandes de réservation** *(FAIT, 2026-07-11 — vérifié en Docker)*

- [x] `submitReservationRequest` (zod, honeypot, rate limit 5/10 min/IP, revalidation
      serveur du chevauchement avec les commandes) + écran de confirmation ; le `mailto:`
      a disparu de `ContactPage`.
- [x] **Calendrier public** dans le formulaire : équipement choisi → sélection de plage
      avec les journées des commandes confirmées grisées (`getUnavailableRangesFn`, dates
      seulement ; `excludeDisabled` empêche d'enjamber une période réservée) ; mention
      « pas une réservation confirmée » ; « Autre / plusieurs » (défaut, 1ʳᵉ option) →
      pas de calendrier. **Période obligatoire quand un équipement précis est choisi**
      (contrôle client + serveur `dates_required`, 2026-07-11) ; « Autre / plusieurs »
      reste sans dates. Le menu liste **tous** les équipements publiés (les « bientôt » /
      « sur demande » se demandent aussi). « Vérifier la disponibilité » des pages de
      catégories → `/contact?equipement=<slug>` : équipement présélectionné, calendrier
      affiché d'emblée (`validateSearch` sur les routes contact). Calendrier **pleine
      largeur** (occupe la largeur du champ ; `classNames={{root/months/month:"w-full"}}`
      + `--cell-size:2.6rem` — le composant shadcn `ui/calendar` est `w-fit` par défaut).
      **Localisé FR/EN** (`locale` de `react-day-picker/locale`). Un seul mois affiché,
      navigation mois par mois via les flèches ‹ ›. ⚠️ **Bug corrigé (2026-07-11)** : les
      flèches (nav en position absolue) fuyaient dans le coin haut-gauche de la page (donc
      injoignables → semblait bloqué au mois courant) parce que l'override `classNames`
      avait retiré le `relative` du composant. Correctif : `classNames.root: "relative
      w-full"` + `buttonVariant="outline"` (flèches bordées visibles). Vérifié par clic
      souris réel : juillet → août, sélection de dates futures OK.
- [x] **Courriel de notification à l'administrateur** (nouveauté demandée le 2026-07-11,
      remplace la décision « pas de courriel sortant ») : nodemailer + variables `SMTP_*`
      (`.env.example`), destinataire = courriel des Coordonnées (BD), **best-effort** —
      SMTP non configuré → simple log, la demande est toujours enregistrée en BD.
- [x] `/admin/demandes` : liste (statut, trace `handled_by`, langue, message), changement
      de statut, et **« Valider → commande »** : trouve ou crée le client (par téléphone),
      crée la commande liée (`orders.request_id`, migration `0003`), passe la demande en
      `traitee` — la disponibilité s'ajuste automatiquement (commandes = source de la
      disponibilité). Conflit de dates → refus avec message.
- [x] Compteur « Demandes nouvelles » sur le tableau de bord.

**4B.4 — Calendrier de disponibilités** *(fait quand : bloquer des dates dans l'admin les
grise immédiatement dans le formulaire public)*

- [ ] `/admin/calendrier` : vue mensuelle des périodes réservées par équipement — les
      indisponibilités sont désormais **dérivées des commandes** (`orders`) ; la table
      `equipment_unavailabilities` reste disponible pour des blocages manuels
      (maintenance) si le besoin se confirme.
- [ ] Action « bloquer ces dates » depuis une demande (pré-remplie, `request_id`).
- [x] `AvailabilityPicker` public (jours grisés via `getUnavailableRangesFn`) + revalidation
      serveur du chevauchement + mention « pas une réservation confirmée » — **livré avec
      4B.3** (calendrier du formulaire de contact).

**4B.5 — Rapports** *(fait quand : compteurs cohérents avec les demandes en BD + CSV
téléchargeable ; accessible au rôle `accountant`)*

- [x] `/admin/rapports` (2026-07-11) : sélecteur de période (30 j / 90 j / 12 mois / tout),
      compteurs (total + par statut), répartition **par équipement** et **par catégorie**
      (+ par mois), export **CSV** (`getReport` / `exportRequestsCsv`, BOM UTF-8 pour Excel).
      Accessible au rôle `accountant` (lecture). Source `reservation_requests` ;
      `equipment_label` fige le libellé (code inclus). Vérifié en Docker.

**4B.6 — Apparence (thème)** *(fait quand : changer un curseur ou un préréglage dans
l'admin change le site public après enregistrement ; « Réinitialiser » revient au thème
par défaut)*

- [x] Extraire la logique du panneau dev (`ThemeTweaker`) vers un module partagé
      `theme.ts` : type `ThemeConfig`, constante `DEFAULT_THEME` (valeurs validées de
      `styles.css`), fonction `themeToCssVars(config)`.
- [x] `getTheme()` injecté au SSR dans le `<html>` (style inline des variables CSS sur
      `:root`) — le site public reflète le thème BD sans flash.
- [x] `/admin/parametres` (onglet Apparence) : mêmes curseurs que le panneau dev + **préréglages d'accent**
      (Or — défaut, Vert, Rouge, Bleu ; chacun = `{goldL, goldC, goldH}` prédéfini, ex.
      vert ≈ hue 150, rouge ≈ hue 25, bleu ≈ hue 250), aperçu en direct avant
      enregistrement, `updateTheme` / `resetTheme`.
- [x] Le panneau dev reste pour le prototypage local ; l'admin devient la voie officielle.

### Recette manuelle (avant de clore la phase)

1. **Auth** : 5 mauvais mots de passe → blocage 15 min ; bon mot de passe → `/admin` ;
   déconnexion ; compte désactivé → accès refusé.
2. **Rôles** : connecté `accountant` → catalogue sans boutons d'édition, demandes en
   lecture, rapports OK ; un appel d'écriture direct (server function) → refusé.
3. **Catalogue** : créer/modifier/dépublier un équipement avec photo ; vérifier côté public
   FR et EN sans redéploiement ; suppression définitive → confirmation + image ImageKit
   supprimée.
4. **Demandes** : soumission publique FR avec dates disponibles → visible dans l'admin ;
   dates chevauchant une indisponibilité → erreur claire ; honeypot rempli → rejet
   silencieux ; 10 soumissions rapides → rate limit.
5. **Calendrier** : bloquer une période → grisée côté public immédiatement (cache
   invalidé) ; « bloquer ces dates » depuis une demande → indisponibilité liée.
6. **Employés** : un admin crée un autre employé → il se connecte ; désactivation → session
   invalidée.
7. **Rapports** : compteurs cohérents avec la BD ; export CSV lisible.
8. **From scratch** : `docker compose down -v && up` → site seedé fonctionnel + login
   de l'admin initial.
9. **Apparence** : appliquer le préréglage « Vert » → le site public change après
   enregistrement ; « Réinitialiser » → retour exact au thème par défaut.
10. **Mobile** : tout le parcours admin au viewport 375 px.

**Fait quand** : les 10 points de recette passent ; `docker compose up` neuf (volumes vides)
aboutit à un site fonctionnel seedé.

---

## Phase 5 — Hébergement et mise en ligne

**Objectif** : le site tourne sur un serveur public avec TLS, déployable/rollbackable par
script en une commande.

**Dépendances** : Phase 4 (l'image et compose sont finaux). Le **serveur existe déjà**
(Docker installé) — il reste 🧍 le domaine.
**Estimation** : 1–1,5 jour.

**Fichiers** : créer `scripts/*.sh`, `infra/docker-compose.prod.yml`, `infra/Caddyfile`,
`infra/README.md`.

Le serveur est **déjà en place** (Docker + compose installés). Reverse proxy/TLS : **Caddy**
en conteneur (Let's Encrypt automatique). DNS : A/AAAA vers le serveur, `www` redirigé vers
l'apex. 🧍 Reste à trancher : le **domaine** (avec le client, ex. `prestigelocations.ca`) et
la **livraison des images** (recommandation : GHCR ; alternative sans registre :
`docker save | ssh docker load`).

### Démarche

1. 🧍 Commander le domaine ; fournir l'accès SSH au serveur (IP, utilisateur).
2. Écrire les scripts (`bash`, `set -euo pipefail`, idempotents, lancés depuis la racine) :
   - `scripts/setup.sh` — **vérifie les prérequis** (Docker + compose plugin présents,
     sinon échoue avec un message clair), crée l'utilisateur `deploy` (membre du groupe
     `docker`), pare-feu ufw (22/80/443), dossier `/srv/prestige`, copie `.env` depuis
     `.env.example` ; idempotent — relançable sans casser l'existant ;
   - `scripts/deploy.sh` — build l'image taguée `git rev-parse --short HEAD`, push (GHCR),
     `ssh deploy@vps docker compose pull && up -d`, attend le healthcheck, affiche l'état ;
   - `scripts/rollback.sh <tag>` — redéploie un tag antérieur ;
   - `scripts/logs.sh` / `scripts/backup.sh` (config, volumes, `pg_dump` quotidien via cron).
3. `infra/docker-compose.prod.yml` : Caddy (80/443, volume certs), `web` non exposé
   directement, `db` non exposé, `restart: always`, limites de logs.
4. `Caddyfile` : domaine → `web:3000`, redirection www→apex, compression.
5. DNS + `VITE_BASE_URL=https://<domaine>` au build → vérifie hreflang/sitemap absolus.
6. Documenter dans `infra/README.md` : premier déploiement, déploiement courant, rollback,
   restauration de sauvegarde.

### Tâches

- [ ] 🧍 Domaine commandé + accès SSH au serveur fourni (noter les infos ici).
- [ ] `setup.sh`, `deploy.sh`, `rollback.sh`, `logs.sh`, `backup.sh`.
- [ ] `docker-compose.prod.yml` + `Caddyfile`.
- [ ] DNS + TLS actifs, `BASE_URL` de prod injectée.
- [ ] `infra/README.md` complet.

**Fait quand** : `scripts/deploy.sh` déploie une nouvelle version en une commande depuis le
poste de dev ; `rollback.sh` restaure la précédente ; HTTPS valide sur le domaine.

---

## Phase 6 — Finitions avant démo

**Dépendances** : Phases 2–4 (idéalement 5, pour une démo sur URL réelle).

- [ ] 🧍 Validation du contenu avec le client : textes FR/EN, photos réelles des équipements
      (à téléverser via `/admin` — bonne démonstration au passage), liens Facebook/Instagram
      réels (actuellement `#` dans le pied de page).
- [ ] 🧍 Clarifier la zone de service et l'adresse (voir « Informations client » :
      Sherbrooke affiché vs adresse à Wolinak) ; ajouter l'adresse au pied de page / page
      contact si souhaité.
- [ ] Image Open Graph de partage (og:image 1200×630) et favicon définitif.
- [ ] Passe accessibilité et mobile (menu, contrastes, tailles tactiles, formulaires).
- [ ] 🧍 **Première démo au client** (jalon paiement : 200 $) — démo type : parcours visiteur
      FR puis EN, puis ajout d'un équipement en direct dans `/admin`.

**Fait quand** : le client a vu la démo et la liste des retours est notée ici.

---

## Phase 7 — Mise en production

**Dépendances** : Phases 5 et 6.

- [ ] Corrections issues de la démo (lister ici au fur et à mesure).
- [ ] Mise en production sur le domaine final (`deploy.sh`).
- [ ] Soumission du sitemap à Google Search Console ; 🧍 suggérer la fiche Google Business
      au client.
- [ ] Vérifications post-lancement : Lighthouse (perf/SEO), redirections 301, hreflang,
      formulaire de contact, parcours admin complet en prod.
- [ ] 🧍 **Livraison** (jalon paiement : 700 $).

**Fait quand** : site public + admin fonctionnels sur le domaine final, vérifications
passées, client notifié.

---

## Phase 8 — Partenariat (2 ans, au fil de l'eau)

- [ ] Sauvegardes vérifiées régulièrement (test de restauration trimestriel) et mises à jour
      de sécurité du serveur.
- [ ] Mises à jour de contenu à la demande du client (textes ; les produits et photos sont
      autonomes via `/admin`).
- [ ] Évolution future : réservation **confirmée** en ligne → tables `customers` /
      `reservations` (alimentent le calendrier automatiquement), quantités par équipement,
      tarifs administrables dans `/admin`, notifications par courriel, paiement éventuel.
