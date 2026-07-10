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

- **En cours** : rien — Phase 1 (Docker) terminée et vérifiée le 2026-07-10.
- **Prochaine étape** : Phase 2 (Catalogue) ; la Phase 3 (ImageKit) attend 🧍 la création
  du compte.

## État actuel

- Site vitrine bilingue FR/EN fonctionnel en développement (TanStack Start / React 19, SSR,
  Tailwind 4) : 5 pages × 2 langues, sélecteur de langue, redirections 301, meta/OG traduits,
  sitemap XML. Textes centralisés dans `src/web/src/lib/i18n.ts` (dictionnaires fr/en typés).
- Réservation : formulaire → courriel au gérant (`mailto:`), pas d'envoi serveur.
- Dépôt restructuré : app web dans `src/web/`, dossiers `infra/` et `scripts/` créés,
  scripts npm proxy à la racine (`npm run dev|build|lint`).
- **Docker opérationnel (Phase 1 faite)** : `infra/docker/web.Dockerfile` (multi-étapes,
  non-root), compose base + overlay dev, healthcheck sur `/fr`, `.env.example` créé,
  `site.ts` lit `VITE_BASE_URL`. Vérifié : FR/EN 200, 301, sitemap, conteneur healthy.
- **Lovable retiré** : `vite.config.ts` est une config standard (tanstackStart + nitro
  `node-server` explicite + react + tailwind + tsconfig-paths, port 8080) ; le wrapper
  d'erreurs SSR (`src/server.ts`, `error-capture`, `error-page`) est conservé.
- Pas de BD ni d'environnement de production.

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
│   └── database/               # BD (à remplir en Phase 4 : schéma, migrations, seed)
├── package.json                # Scripts proxy (dev/build/lint → src/web)
├── PROJET.md                   # Cadrage client (gelé)
└── TASK.md
```

## Ordre d'exécution

```
Phase 2 (Catalogue)┐
Phase 3 (ImageKit)─┴─> Phase 4 (BD + Admin) ──> Phase 5 (Hébergement) ──> Phase 6 (Démo)
                                                                              │
                                                       Phase 7 (Production) <─┘
                                                       Phase 8 (Partenariat, continu)
```

*(Phase 1 — Docker : terminée.)* Les phases 2 et 3 sont **indépendantes entre elles**
(parallélisables). La 4 dépend des deux. Les suivantes sont séquentielles.

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
| `VITE_IMAGEKIT_URL_ENDPOINT` | build arg (public) | `images.ts` (URLs CDN) | vide → assets locaux | URL du compte | 3 |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` | runtime (secret) | signature d'upload | mêmes clés (dossier `dev/` recommandé) | clés du compte | 4 |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | runtime (secret) | service `db` | valeurs simples | mot de passe fort généré | 4 |
| `DATABASE_URL` | runtime (secret) | `web` (Drizzle) et `npm run dev` | `postgres://…@localhost:5432/…` | `postgres://…@db:5432/…` | 4 |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | runtime (secret) | `seed.ts` (superadmin) | compte de test | vraies valeurs du gérant | 4 |
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
| **Client** (`customers`) | **Aucun pour l'instant** — pas de connexion client | Site public uniquement ; demande de réservation via le formulaire de contact. La table `customers` n'arrive qu'avec la réservation en ligne (Phase 8) |
| **Employé** (`users`) | Oui — rôles `superadmin`, `admin`, `accountant` | Tableau d'administration `/admin` (Phase 4) |

Permissions des employés au lancement :

| Rôle | Catalogue (CRUD + photos) | Demandes de réservation | Comptes employés | Vocation future |
|---|---|---|---|---|
| `superadmin` | ✓ | ✓ (traiter, statuer) | ✓ (création, rôle, désactivation) | Tout |
| `admin` | ✓ | ✓ (traiter, statuer) | — | Réservations confirmées (Phase 8) |
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

### Catégories (3)

| Slug | FR | EN |
|---|---|---|
| `machinerie` | Machinerie | Machinery |
| `remorques` | Remorques | Trailers |
| `petits-equipements` | Petits équipements | Small equipment |

### Équipements (catalogue actuel)

| Slug | Catégorie | FR / EN | Statut |
|---|---|---|---|
| `mini-pelle` | machinerie | Mini-pelle (excavatrice compacte) / Mini excavator | disponible |
| `tracteur-compact` | machinerie | Tracteur compact avec accessoires / Compact tractor | disponible |
| `plateforme-elevatrice` | machinerie | Plateforme élévatrice / Aerial lift | **bientôt** |
| `godets-accessoires` | machinerie | Godets et accessoires variés / Buckets & attachments | disponible |
| `trailer-dompeur` | remorques | Trailer dompeur / Dump trailer | disponible |
| `trailer-ferme` | remorques | Trailer fermé / Enclosed trailer | disponible |
| `trailer-plateforme` | remorques | Trailer plateforme / Flatbed trailer | disponible |
| `attaches-remorquage` | remorques | Attaches et accessoires / Hitches & accessories | disponible |
| `compacteur` | petits-equipements | Compacteur à plaque vibrante / Plate compactor | disponible |
| `scie-a-beton` | petits-equipements | Scie à béton / Concrete saw | disponible |
| `marteau-piqueur` | petits-equipements | Marteau-piqueur / Jackhammer | disponible |
| `outillage-specialise` | petits-equipements | Outillage spécialisé sur demande / Specialized tools | sur demande |

### Attributs d'un équipement (modèle cible)

`slug` (id stable), `category`, `name` {fr, en}, `description` {fr, en},
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
| `<CdnImage>` *(à créer, Phase 3)* | Image ImageKit avec transformations | catalogue |
| `admin/LoginPage` *(à créer, Phase 4)* | Connexion des employés | BD (users) |
| `admin/EquipmentList` *(à créer, Phase 4)* | Liste + statuts des équipements | BD |
| `admin/EquipmentForm` *(à créer, Phase 4)* | Ajout/édition (FR+EN, statut, photo) | BD + ImageKit |
| `admin/UserList` / `UserForm` *(à créer, Phase 4)* | Comptes employés (superadmin) | BD (users) |
| `admin/RequestList` *(à créer, Phase 4)* | Demandes de réservation (filtres, statuts) | BD (reservation_requests) |
| `admin/AvailabilityCalendar` *(à créer, Phase 4)* | Indisponibilités par équipement | BD (equipment_unavailabilities) |
| `AvailabilityPicker` *(à créer, Phase 4)* | Choix de dates du formulaire public (jours grisés) | BD via `getUnavailableDates` |
| `admin/Reports` *(à créer, Phase 4)* | Rapports/analyse des demandes, export CSV | BD (reservation_requests) |
| `ui/*` | Bibliothèque shadcn/ui (boutons, formulaires…) | — |

---

## Phase 2 — Catalogue d'équipements (modèle de données)

**Objectif** : une **source de vérité unique** pour catégories/équipements (voir « Domaine
métier »), au lieu de listes dupliquées dans les dictionnaires i18n. Deviendra le seed de la
BD en Phase 4.

**Dépendances** : aucune. Parallélisable avec les phases 1 et 3.
**Estimation** : 0,5–1 jour.

**Fichiers** : créer `src/web/src/lib/catalog.ts` ; modifier
`src/web/src/components/home/CategoriesSection.tsx`, `CategoryCard.tsx`,
`src/web/src/components/pages/EquipmentPage.tsx`, `ContactPage.tsx`,
`src/web/src/lib/i18n.ts` (retrait des données métier).

### Choix

| Choix | Décision | Justification |
|---|---|---|
| Emplacement | `src/web/src/lib/catalog.ts` | Consommé uniquement par le web pour l'instant ; migrera en donnée de seed |
| Forme | Objets TS typés `Category[]` + `EquipmentItem[]` avec champs bilingues `{fr, en}` | Aligné sur le futur schéma BD ; pas de dépendance |
| Frontière i18n / catalogue | i18n garde les libellés d'interface (titres de sections, CTA, formulaire) ; le catalogue porte les **données métier** (noms, descriptions, statuts des équipements) | Une seule chose à modifier quand le catalogue change |
| Descriptions de la page Équipements | Restent par **catégorie** dans le catalogue (`Category.description {fr,en}`), les items de liste deviennent des équipements + `note` optionnelle | C'est la structure actuelle de la page ; pas de refonte visuelle |

### Démarche

1. Créer les types (`Lang` réutilisé de `i18n.ts`) :
   `Category { slug, name: {fr,en}, description: {fr,en}, image }` et
   `EquipmentItem { slug, category, name: {fr,en}, note?: {fr,en}, status, featured }`.
2. Saisir les données des tableaux « Domaine métier » ci-dessus (3 catégories,
   12 équipements) en reprenant **mot pour mot** les textes actuels de `i18n.ts`.
3. Refactorer les consommateurs un par un, en vérifiant visuellement à chaque étape :
   `CategoriesSection`/`CategoryCard` → `EquipmentPage` → options du `<select>` de
   `ContactPage` (générées du catalogue, libellé selon la langue).
4. Supprimer des dictionnaires i18n les données migrées (ne garder que les libellés d'UI).
5. Vérifier : diff visuel FR/EN nul (comparer les pages avant/après), tsc + eslint.

### Tâches

- [ ] `catalog.ts` : types + 3 catégories + 12 équipements.
- [ ] Refactor `CategoriesSection` / `CategoryCard`.
- [ ] Refactor `EquipmentPage`.
- [ ] Options du formulaire de contact générées du catalogue.
- [ ] Nettoyage des dictionnaires i18n.
- [ ] Statuts affichés depuis le catalogue (`bientôt disponible`, `sur demande`).

**Fait quand** : aucune donnée d'équipement ne subsiste dans `i18n.ts` ; le rendu FR/EN est
identique à l'existant.

---

## Phase 3 — Gestion des images (ImageKit)

**Objectif** : photos servies par le CDN ImageKit (optimisation auto) ; remplacement de
photos sans redéploiement.

**Dépendances** : aucune pour le code (la Phase 2 doit être finie pour brancher le
catalogue — sinon garder cette étape pour la fin). 🧍 Création du compte ImageKit par le
prestataire (plan gratuit : 20 Go de bande passante/mois — largement suffisant).
**Estimation** : 0,5 jour de code + attente du compte.

**Fichiers** : créer `src/web/src/lib/images.ts`,
`src/web/src/components/site/CdnImage.tsx` ; modifier `catalog.ts` (clés d'images),
`CategoryCard.tsx`, `EquipmentPage.tsx`.

### Choix

| Choix | Décision | Justification |
|---|---|---|
| SDK côté site public | **Aucun** — helper maison `imageUrl(key, {w,h})` qui concatène l'URL endpoint + transformations (`tr:w-800,f-auto,q-auto`) | Afficher une image ImageKit = construire une URL ; pas besoin de dépendance |
| Organisation des médias | Dossiers `prestige-locations/{equipements,hero,logo}` ; la **clé** (chemin) est stockée dans le catalogue (`image`) | Correspond au champ `image_key` de la future BD |
| Variables d'env | `VITE_IMAGEKIT_URL_ENDPOINT` (public, bakée au build). La clé privée n'arrive qu'en Phase 4 (serveur) | Seule l'URL endpoint est nécessaire pour afficher |
| Images d'ambiance (héro, CTA) | Peuvent rester en assets bundlés (elles ne changent jamais) ; **photos d'équipements** passent par ImageKit | Limiter la migration à ce qui a besoin d'être dynamique |
| Fallback | Si `VITE_IMAGEKIT_URL_ENDPOINT` absent → assets locaux actuels | Le dev local marche sans compte ImageKit |

### Démarche

1. 🧍 Créer le compte ImageKit, noter l'URL endpoint, créer l'arborescence de dossiers.
2. 🧍 Téléverser les photos actuelles de `src/web/src/assets/` (via le dashboard ImageKit).
3. Créer `src/web/src/lib/images.ts` : `imageUrl(key, opts)` + fallback assets locaux.
4. Créer `<CdnImage>` (wrapper `<img>` : srcset 1x/2x, width/height, loading lazy).
5. Brancher le catalogue : `Category.image` / `EquipmentItem.image` = clés ImageKit ;
   `CategoryCard` et `EquipmentPage` utilisent `<CdnImage>`.
6. Vérifier : Lighthouse avant/après (poids des pages), comportement sans env var.

### Tâches

- [ ] 🧍 Compte ImageKit + dossiers + upload des photos actuelles.
- [ ] `images.ts` (helper + fallback) et `<CdnImage>`.
- [ ] Catalogue branché sur les clés ImageKit.
- [ ] Vérification poids de page + fallback local.

**Fait quand** : les photos d'équipements sont servies par ImageKit en build « prod » et par
les assets locaux en dev sans configuration.

---

## Phase 4 — Base de données et tableau d'administration

**Objectif** : le gérant peut **ajouter, modifier et téléverser des produits** lui-même,
sans redéploiement. Le site public lit le catalogue depuis la BD.

**Dépendances** : Phase 2 (types + seed), Phase 3 (upload de photos) ; le compose de la
Phase 1 (faite) reçoit le service `db`. C'est la phase la plus lourde — exécuter dans l'ordre
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
Équipements, Catégories, Demandes, Calendrier, Rapports, Employés** (superadmin seulement),
**Mon compte**, Se déconnecter.

| Route | Page | Contenu |
|---|---|---|
| `/admin/login` | Connexion | Hors layout protégé |
| `/admin` | Tableau de bord | Compteurs : demandes `nouvelle`, équipements publiés, prochaines indisponibilités |
| `/admin/equipements` (+ `/nouveau`, `/$id`) | Équipements | Liste (catégorie, statut, photo, publié) + formulaire |
| `/admin/categories` | Catégories | Renommage FR/EN, ordre |
| `/admin/demandes` | Demandes | Liste filtrable, changement de statut, action « bloquer ces dates » |
| `/admin/calendrier` | Calendrier | Indisponibilités par équipement (vue mensuelle) |
| `/admin/rapports` | Rapports | Compteurs par période, répartition, export CSV |
| `/admin/employes` | Employés | superadmin : création, rôle, activation, reset mot de passe |
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
| `updateCategory`, `reorderCategories` | admin+ | → entité | invalide le cache |
| `listRequests(filters)`, `updateRequestStatus(id, status)` | admin+ (`accountant` : lecture) | → liste paginée / entité | trace `handled_by`/`handled_at` |
| `list/create/deleteUnavailability` | admin+ | equipmentId, dates, raison, note → entité | `create` accepte `request_id` (action « bloquer ces dates ») |
| `list/create/updateUser`, `resetUserPassword` | superadmin | → entité | jamais de suppression, `active` seulement |
| `getReport(period)`, `exportRequestsCsv(period)` | accountant+ | → agrégats / CSV | volume, répartition équipement/catégorie |
| `getImageKitSignature()` | admin+ | → `{signature, token, expire}` | la clé privée reste serveur |

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
`user_role` = `superadmin` | `admin` | `accountant` ;
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
- **1 employé `superadmin`** créé depuis `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  (env) au premier seed ; jamais écrasé s'il existe. Les autres comptes employés se créent
  ensuite via l'admin (superadmin uniquement).
- Seed **idempotent** : upsert par `slug` (met à jour les textes, préserve `image_key`,
  `published` et `position` modifiés via l'admin).

#### Prévu pour la Phase 8 (ne pas créer maintenant)

`customers` (nom, téléphone, courriel, notes — les clients de la plateforme, toujours sans
connexion), `reservations` (customer_id, equipment_id, dates, statut — la réservation
**confirmée**, qui alimentera le calendrier automatiquement), colonne `quantite` sur
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
   création du `superadmin` (`ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` en env, hash au
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
  min. 10 caractères) ; le `superadmin` peut réinitialiser celui d'un autre employé (défini
  à la main, communiqué hors plateforme). **Pas de « mot de passe oublié » par courriel au
  lancement** (pas d'envoi de courriels sortants) — la réinitialisation passe par le
  superadmin ; à revoir si le nombre d'employés grandit.
- **Pas d'auto-inscription** : aucun formulaire public de création de compte ; seuls les
  superadmins créent des comptes. Désactiver un compte (`active = false`) invalide ses
  sessions au prochain contrôle.

### Démarche — 4B : admin

7. Routes : `/admin/login`, layout `/admin` protégé (voir spécification ci-dessus), pages
   liste + formulaire équipement, page catégories, page « Mon compte », pages comptes
   employés (superadmin).
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

- [ ] Workspaces + paquet `@prestige/database` (schéma, migration initiale).
- [ ] Service `db` dans compose (base + overlay dev :5432) + `DATABASE_URL`.
- [ ] `seed.ts` idempotent (catalogue + superadmin).
- [ ] Site public lit la BD : `db.ts`, `catalog-server.ts` (cache 60 s), `getCatalog()`.

**4B.1 — Authentification** *(fait quand : la recette « auth » ci-dessous passe)*

- [ ] `lib/auth.ts` (hash, sessions, `requireUser(role)`) + `lib/rate-limit.ts`.
- [ ] `/admin/login`, layout protégé, déconnexion, « Mon compte » (changement de mot de
      passe), conforme à la spécification ci-dessus.
- [ ] Comptes employés (`/admin/employes`, superadmin) : création, rôle,
      activation/désactivation, reset mot de passe ; pas de suppression.

**4B.2 — Catalogue dans l'admin** *(fait quand : ajout d'un équipement avec photo visible
côté public sans redéploiement)*

- [ ] Tableau de bord `/admin` (compteurs simples).
- [ ] Équipements : liste + formulaire (FR+EN, statut, featured, publié, ordre).
- [ ] Catégories : renommage FR/EN, ordre.
- [ ] Upload photo signé → ImageKit (`getImageKitSignature`), aperçu, remplacement
      (suppression de l'ancienne image), `image_key` en BD.

**4B.3 — Demandes de réservation** *(fait quand : une soumission publique apparaît dans
`/admin/demandes` et le `mailto:` a disparu)*

- [ ] `submitReservationRequest` (zod, honeypot, rate limit) + écran de confirmation ;
      suppression du `mailto:` dans `ContactPage`.
- [ ] `/admin/demandes` : liste filtrable (statut/équipement/période), changement de statut,
      trace `handled_by`.

**4B.4 — Calendrier de disponibilités** *(fait quand : bloquer des dates dans l'admin les
grise immédiatement dans le formulaire public)*

- [ ] `/admin/calendrier` : indisponibilités par équipement (ajout/retrait, raison, note).
- [ ] Action « bloquer ces dates » depuis une demande (pré-remplie, `request_id`).
- [ ] `AvailabilityPicker` public (jours grisés via `getUnavailableDates`) + revalidation
      serveur du chevauchement + mention « pas une réservation confirmée ».

**4B.5 — Rapports** *(fait quand : compteurs cohérents avec les demandes en BD + CSV
téléchargeable ; accessible au rôle `accountant`)*

- [ ] `/admin/rapports` : volume par période, répartition équipement/catégorie, export CSV.

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
6. **Employés** : superadmin crée un `admin` → il se connecte ; désactivation → session
   invalidée.
7. **Rapports** : compteurs cohérents avec la BD ; export CSV lisible.
8. **From scratch** : `docker compose down -v && up` → site seedé fonctionnel + login
   superadmin.
9. **Mobile** : tout le parcours admin au viewport 375 px.

**Fait quand** : les 9 points de recette passent ; `docker compose up` neuf (volumes vides)
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
