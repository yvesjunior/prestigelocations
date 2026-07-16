# Prestige Locations

Site vitrine bilingue (FR/EN) + tableau de bord d'administration pour une entreprise
de **location d'équipements**. Le contenu du site est **piloté par la base de données**
(catégories, équipements, textes des pages, coordonnées, logo, diaporama, tarifs…),
éditable depuis `/admin` — aucune donnée métier n'est codée en dur.

## Stack

- **Monorepo npm workspaces**
  - `@prestige/web` — [TanStack Start](https://tanstack.com/start) (React 19, SSR), Tailwind CSS 4, TypeScript
  - `@prestige/database` — [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL 16
- **Médias** : ImageKit (CDN, téléversement depuis l'admin ; repli sur des images bundlées)
- **Courriel sortant** : SendGrid (API HTTP) — notifications des demandes de réservation
- **Conteneurisation** : Docker + Docker Compose

## Prérequis

- Node.js 20+ et npm
- Docker + Docker Compose (pour la base de données et l'image de production)

## Démarrage rapide

```sh
# 1. Dépendances
npm install

# 2. Configuration — copier le modèle et remplir
cp .env.example .env

# 3. Lancer la base de données (conteneur Postgres)
docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up -d db

# 4. Migrations + données initiales (à refaire après un checkout neuf)
npm run db:setup

# 5. Serveur de développement (port 8080, HMR)
npm run dev
```

Le site public est sur `http://localhost:8080`, l'admin sur `http://localhost:8080/admin`.

### Image Docker « comme en production »

```sh
# Build + lancement de toute la pile (web sur :3000, db sur :5432)
docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up -d --build

# Après un premier lancement / une base vide :
npm run db:setup
```

> ⚠️ Le conteneur ne se met pas à jour à chaud : après un changement de code,
> refaire `up -d --build`. Les migrations/seed ne sont pas encore automatiques au
> démarrage du conteneur — lancer `npm run db:setup` manuellement.

## Scripts (racine)

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de dev (`@prestige/web`), port 8080 |
| `npm run build` | Build de production |
| `npm run preview` | Aperçu du build |
| `npm run prod [up\|restart\|logs\|down]` | Pile de **production** (web seul, Postgres hôte) — voir Déploiement |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run db:generate` | Générer une migration depuis le schéma Drizzle |
| `npm run db:migrate` | Appliquer les migrations |
| `npm run db:seed` | Insérer les données initiales |
| `npm run db:setup` | `migrate` + `seed` |

## Variables d'environnement

Tout est dans `.env` (copié de `.env.example`). `.env` est **gitignoré** — ne jamais le committer.
Les variables `VITE_*` sont **bakées au build** (publiques, jamais de secret).

| Variable | Rôle |
|---|---|
| `WEB_PORT` / `DB_PORT` | Ports **hôte** publiés par Docker (défauts 3000 / 5432) — un par site sur un serveur mutualisé |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Base de données |
| `DATABASE_URL` | `localhost` hors conteneur (`npm run dev`), `db` dans compose |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Superadmin créé au premier seed (mot de passe ≥ 10 car.) |
| `VITE_BASE_URL` | URL publique (prod : `https://prestigelocations.ca`) — sitemap/hreflang/og |
| `VITE_IMAGEKIT_URL_ENDPOINT` | Endpoint public ImageKit (vide = photos bundlées) |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_FOLDER` | Clés ImageKit (secrets) + dossier racine |
| `SENDGRID_API_KEY` / `SENDGRID_FROM` | Envoi des notifications (expéditeur vérifié requis) |
| `SITE_MODE` | `basic` (défaut) ou `advanced` — voir ci-dessous |
| `ENV` | `prod` (défaut) ou `dev` — aides de test ; voir ci-dessous |
| `VITE_THEME_TWEAKER` | `1` = panneau de réglage du thème sur le site public (tests) |

### `SITE_MODE` — basique vs avancé

Lu au **runtime** (changer la valeur + redémarrer le conteneur suffit, pas de rebuild).

- **`basic`** (défaut) : vitrine + **demande simple**. Le visiteur choisit des équipements
  et envoie une demande (enregistrée en BD + envoyée par courriel) ; un employé rappelle.
  Pas de calendrier de disponibilité, pas de pages admin Demandes/Commandes/Rapports.
- **`advanced`** : ajoute le **calendrier de disponibilité** sur le formulaire et la
  gestion en plateforme (**Demandes → Commandes**, blocage des dates, **Rapports**).
  Les demandes reçues en mode basique réapparaissent une fois l'avancé activé.

### `ENV` — aides de développement/test

- **`prod`** (défaut) : aucune aide exposée.
- **`dev`** : la page `/admin/login` affiche un encart « Accès de démonstration » avec les
  identifiants (bouton copier + remplissage auto) — pratique pour tester via un tunnel.
  **⚠️ Ne jamais mettre `ENV=dev` en production** (exposerait le mot de passe admin).

## Administration (`/admin`)

Connexion dev : `admin@prestige.local` / `prestige-dev` (défini par `ADMIN_*`).
Rôles : **admin** (accès complet, gestion des employés) et **accountant** (lecture seule).

Tout le contenu se gère depuis le tableau de bord :

- **Équipements** — CRUD, photo, statut, ordre, **tarifs jour/semaine/fin de semaine/mois**,
  filtre par catégorie ; suppression même si liée à des commandes (avec confirmation).
- **Catégories** — CRUD, photo, textes bilingues, points forts (puces).
- **Pages** — textes bilingues de chaque page (Accueil, Équipements, Services, À propos,
  Contact, Sections communes), **diaporama d'accueil** et **image « À propos »**.
- **Paramètres** — thème (couleurs), **logo** de marque, interrupteur d'affichage des **tarifs**.
- **Contact** (onglet Pages › Contact) — téléphone, courriel, **réseaux sociaux** (affichés
  au pied de page quand renseignés), région desservie.
- **Demandes / Commandes / Rapports** — visibles seulement en `SITE_MODE=advanced`.

## Base de données

- Schéma : `src/database/schema/`, migrations : `src/database/migrations/` (Drizzle).
- Après modification du schéma : `npm run db:generate` puis `npm run db:migrate`.
- Le contenu configurable vit dans la table `settings` (clés : `theme`, `contact`,
  `page_content`, `branding`, `pricing`, `hero`, `about`) et les tables `categories` /
  `equipments`.

## Déploiement (prod : Postgres sur l'hôte, pas de conteneur `db`)

En production l'app tourne **web seul** et se connecte à un **PostgreSQL déjà présent
sur l'hôte** (un serveur Postgres partagé, idéalement **une base par site**). On utilise
`infra/docker-compose.prod.yml` (web uniquement — aucun conteneur `db`).

1. **Base de données (sur l'hôte)** — créer une base dédiée et y importer le contenu
   exporté depuis le dev (voir « Exporter / importer la base » ci-dessous) :
   ```sh
   createdb prestige                          # ou: psql -c "CREATE DATABASE prestige;"
   psql -d prestige < prestige-db-export.sql
   ```
   Le Postgres de l'hôte doit accepter les connexions du conteneur : soit `listen_addresses`
   + une ligne `pg_hba.conf` pour le sous-réseau Docker, soit `network_mode: host` (voir le
   commentaire dans `docker-compose.prod.yml`).
2. **`.env` de prod** — `ENV=prod`, `SITE_MODE` au choix, `VITE_BASE_URL=https://prestigelocations.ca`,
   clés ImageKit/SendGrid (**expéditeur SendGrid vérifié**), et le `DATABASE_URL` de l'hôte :
   ```
   DATABASE_URL=postgres://prestige:MOT_DE_PASSE@host.docker.internal:5432/prestige
   ```
3. **Lancer web seul** (ne PAS lancer `db:setup`/`seed` : schéma + données viennent de l'import) :
   ```sh
   npm run prod                 # raccourci de scripts/prod.sh (build + up -d)
   # équivaut à :
   docker compose --env-file .env -f infra/docker-compose.prod.yml up -d --build
   ```
   Autres actions : `npm run prod restart` (recrée le conteneur après un changement de
   `.env` — ex. `SENDGRID_FROM` —, sans rebuild), `npm run prod logs` (suivi des logs),
   `npm run prod down` (arrêt).
4. **Après import** : changer le mot de passe admin (Admin › Mon compte).
5. **Exposer le site** :
   - **Tunnel Cloudflare nommé** (`cloudflared`) : réseau privé, sans IP publique ni port
     ouvert, sur `prestigelocations.ca` (TLS gratuit, reconnexion auto).
   - ou reverse-proxy classique (Caddy/Nginx) + TLS.
6. **Courriels** : enregistrements DNS (MX pour la réception ; CNAME DKIM + SPF pour l'envoi
   via SendGrid).

### Exporter / importer la base

```sh
# Export depuis le dev (conteneur db) — dump SQL portable (schéma + données) :
docker exec prestige-locations-db-1 pg_dump -U prestige -d prestige \
  --clean --if-exists --no-owner --no-privileges > prestige-db-export.sql

# Import dans le Postgres de l'hôte de prod (base dédiée) :
psql -d prestige < prestige-db-export.sql
```
> Le dump inclut le schéma, les données et les enregistrements de migration Drizzle —
> ne pas relancer `db:migrate`/`db:seed` après un import. Les `image_key` pointent vers
> ImageKit : l'hôte de prod doit utiliser les **mêmes** clés `IMAGEKIT_*`.

## Structure

```
src/
  web/         @prestige/web — application (routes, components, server fns, lib)
  database/    @prestige/database — schéma Drizzle, migrations, seed
infra/         docker-compose(.dev).yml, docker/web.Dockerfile
PROJET.md      cadrage du projet (figé)
TASK.md        plan de travail détaillé + « Prochaine action »
```
