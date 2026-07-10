# Projet Prestige Locations — Portée et intervenants

> Document de cadrage du projet. Les champs marqués `À confirmer` restent à compléter.

## 1. Contexte

**Prestige Locations** est une entreprise de location d'équipements (machinerie, remorques et petits équipements) basée à **Sherbrooke, Québec**, desservant toute la région. L'entreprise souhaite une présence web professionnelle pour présenter son inventaire, ses formules de location et permettre aux clients de la contacter facilement pour réserver.

Le mandat consiste à concevoir, développer et livrer un **site vitrine** moderne, rapide et optimisé pour le référencement local.

## 2. Le client

| | |
|---|---|
| **Entreprise** | Prestige Locations |
| **Secteur** | Location d'équipements de construction et de transport |
| **Localisation** | Sherbrooke (QC) et région |
| **Personne-ressource** | À confirmer |
| **Téléphone** | 819-269-3129 |
| **Courriel** | prestigelocations@outlook.com |

### Besoins exprimés

- Présenter l'inventaire par catégories : **machinerie** (mini-pelle, tracteur compact, plateforme élévatrice à venir), **remorques** (dompeur, fermée, plateforme) et **petits équipements** (compacteurs, scies à béton, marteaux-piqueurs).
- Mettre en avant les **formules de location** : à la journée, à la semaine, au mois, avec **livraison sur chantier** dans la région de Sherbrooke.
- Faciliter la **prise de contact et la réservation** (téléphone en un clic, formulaire de contact par courriel).
- Projeter une image **haut de gamme et de confiance** : équipements récents et inspectés, service transparent sans frais cachés, entreprise locale.

## 3. Le prestataire

| | |
|---|---|
| **Nom** | Yves Bationo |
| **Rôle** | Conception et développement web (mandat complet : design, intégration, développement, mise en ligne) |
| **Courriel** | yvesjuniorbationo@gmail.com |

## 4. Portée du projet

### Inclus

- **Site vitrine bilingue (français / anglais) de 5 pages**, le français étant la langue par défaut :
  - **Accueil** — héro avec slogan (« Le bon équipement, au bon moment. »), catégories d'équipements, arguments clés, appels à l'action.
  - **Équipements** — inventaire détaillé par catégorie avec photos.
  - **Services** — formules de location (journée / semaine / mois) et livraison.
  - **À propos** — présentation et valeurs de l'entreprise.
  - **Contact & Réservation** — coordonnées cliquables et formulaire de réservation.
- **Réservation (phase initiale)** : la demande de réservation du client sera transmise par courriel au gérant, qui communiquera ensuite avec le client grâce aux coordonnées reçues du formulaire.
- **Architecture évolutive** : la plateforme sera conçue pour permettre l'ajout futur d'une fonctionnalité de réservation directement sur la plateforme (calendrier de disponibilité, confirmation en ligne), sans refonte du site.
- **Identité visuelle** : thème sombre premium avec accents dorés, photos d'ambiance de chantier.
- **Gestion des images (ImageKit)** : photos hébergées sur un CDN avec optimisation automatique (format, taille), permettant d'ajouter ou de remplacer des photos d'équipements sans redéploiement du site.
- **Bilinguisme** : contenu intégral en français et en anglais, avec sélecteur de langue dans l'en-tête, le français étant la langue par défaut.
- **Référencement (SEO)** : balises meta et Open Graph par page (dans les deux langues), sitemap XML, rendu côté serveur (SSR) pour l'indexation.
- **Responsive** : adapté mobile, tablette et bureau.

### Exclus (hors portée actuelle)

- Réservation en ligne avec paiement ou calendrier de disponibilité en temps réel (prévue comme évolution future — l'architecture sera conçue pour l'accueillir, voir ci-dessus).
- Espace client / authentification.
- Gestion de contenu (CMS) — le contenu est maintenu dans le code.
- Rédaction juridique (conditions de location, politique de confidentialité).

## 5. Fonctionnalités prévues de la plateforme

### Pages et contenu

| Page | Contenu |
|---|---|
| **Accueil** | Héro avec slogan « Le bon équipement, au bon moment. », barre d'arguments clés (équipements fiables, réservation simple, flexibilité totale, service courtois), présentation des 3 catégories d'équipements, section d'appel à l'action |
| **Équipements** | Inventaire par catégorie — machinerie, remorques, petits équipements — avec photos et listes détaillées |
| **Services** | Les 4 formules de location (journée, semaine, mois, livraison sur chantier) et le parcours client « Simple en trois étapes » |
| **À propos** | Mission et valeurs de l'entreprise (qualité, confiance, proximité) |
| **Contact & Réservation** | Coordonnées cliquables et formulaire de demande de réservation |

### Réservation et contact

- **Formulaire de demande de réservation** : nom, téléphone, choix d'équipement, message libre (dates, durée, détails du projet).
- **Circuit de la phase initiale** : la demande sera transmise par courriel au gérant, qui recontactera le client grâce aux coordonnées reçues du formulaire.
- **Téléphone en un clic** (`tel:`) dans le héro, la section d'appel à l'action, le pied de page et la page contact.
- **Courriel en un clic** (`mailto:`) vers prestigelocations@outlook.com.

### Bilinguisme

- Le site sera **intégralement bilingue français / anglais**, le français étant la langue par défaut.
- **URLs distinctes par langue** (ex. : `/fr/equipements` ↔ `/en/equipment`), bénéfique pour le référencement dans les deux langues.
- **Sélecteur FR / EN** dans l'en-tête (bureau et mobile), qui gardera le visiteur sur la même page lors du changement de langue.

### Référencement (SEO)

- **Rendu côté serveur (SSR)** : les pages arriveront complètes aux moteurs de recherche.
- **Balises meta et Open Graph traduites par page** (titre, description, aperçu de partage sur les réseaux sociaux).
- **Attribut de langue correct** (`lang="fr"` / `lang="en"`) sur chaque page, avec balises `hreflang` reliant les deux versions.
- **Sitemap XML** généré automatiquement (5 pages × 2 langues).

### Expérience utilisateur

- **Responsive** : adapté mobile (menu hamburger), tablette et bureau.
- **Identité visuelle premium** : thème sombre aux accents dorés, typographies soignées, photos d'ambiance de chantier.
- **Images optimisées via CDN (ImageKit)** : chargement rapide des photos et mise à jour des photos d'équipements sans redéploiement.
- **Pages 404 et page d'erreur** personnalisées et traduites.

### Évolutions futures (architecture prête à les accueillir)

La plateforme sera conçue pour accueillir ces ajouts **sans refonte du site** :

- **Réservation directement sur la plateforme** : calendrier de disponibilité en temps réel, confirmation en ligne, éventuellement paiement.

## 6. Livrables

1. Site web complet (5 pages) conforme à la portée ci-dessus.
2. Code source versionné (Git).
3. Mise en ligne du site sur l'hébergement retenu (inclus — Option 2).
4. Hébergement, mises à jour et maintenance pendant 2 ans (inclus — Option 2).

## 7. Échéancier

- **Durée du projet** : 2 à 3 semaines au maximum, de la signature du contrat à la mise en production.
- Jalons : signature → première démo → mise en production (alignés sur les modalités de paiement).

## 8. Offre de service et tarification

Deux options ont été proposées au client :

| | ~~Option 1~~ (non retenue) | **Option 2 — retenue ✓** |
|---|---|---|
| **Prix** | ~~500 $ CAD~~ | **1 000 $ CAD** |
| **Conception du site** | ~~✓~~ | ✓ |
| **Déploiement (mise en ligne)** | ~~—~~ | ✓ |
| **Hébergement** | ~~—~~ | ✓ (inclus pendant 2 ans) |
| **Mises à jour et maintenance** | ~~—~~ | ✓ (incluses pendant 2 ans) |
| **Durée de l'engagement** | ~~Livraison unique~~ | **Partenariat de 2 ans** |

**Le client a retenu l'Option 2.** Pendant la durée du partenariat (2 ans), le prestataire prend en charge l'ensemble des aspects du site : hébergement, nom de domaine, déploiements, mises à jour de contenu et corrections.

- **Date de début du partenariat** : À confirmer
- **Renouvellement après 2 ans** : à discuter à l'échéance (hébergement et maintenance)

### Modalités de paiement

| Étape | Montant |
|---|---|
| À la signature du contrat | 100 $ CAD |
| À la première démo | 200 $ CAD |
| Après la mise en production | 700 $ CAD |
| **Total** | **1 000 $ CAD** |

## 9. Signatures

Les parties reconnaissent avoir lu et accepté la portée, les livrables, l'échéancier et les modalités de paiement décrits dans le présent document.

### Le client — Prestige Locations

| | |
|---|---|
| **Nom** | _______________________________ |
| **Date** | _______________________________ |
| **Signature** | _______________________________ |

### Le prestataire

| | |
|---|---|
| **Nom** | Yves Bationo |
| **Date** | _______________________________ |
| **Signature** | _______________________________ |
