#!/usr/bin/env bash
# Lancement de la pile de PRODUCTION : conteneur web SEUL, connecté au PostgreSQL
# déjà présent sur l'hôte (voir infra/docker-compose.prod.yml). Aucun conteneur `db`.
#
# Usage :
#   ./scripts/prod.sh              # build + (re)démarrage en arrière-plan
#   ./scripts/prod.sh up           # idem (défaut)
#   ./scripts/prod.sh down         # arrêt de la pile
#   ./scripts/prod.sh logs         # suivi des logs du conteneur web
#   ./scripts/prod.sh restart      # recrée le conteneur (relit .env, ex. SENDGRID_FROM)
#
# ⚠️ .env doit contenir un DATABASE_URL pointant vers le Postgres de l'hôte et ENV=prod.
set -euo pipefail

# Racine du dépôt = dossier parent de scripts/, quel que soit le cwd.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Erreur : .env introuvable à la racine ($ROOT). Copiez .env.example et renseignez-le." >&2
  exit 1
fi

COMPOSE=(docker compose --env-file .env -f infra/docker-compose.prod.yml)
ACTION="${1:-up}"

case "$ACTION" in
  up)
    # --build : reconstruit l'image (changement de code). --remove-orphans : nettoie
    # tout conteneur `db` résiduel d'un lancement via le mauvais fichier compose.
    "${COMPOSE[@]}" up -d --build --remove-orphans
    ;;
  restart)
    # Recrée le conteneur sans rebuild : suffit pour un simple changement de .env
    # (SENDGRID_FROM, SITE_MODE, ENV…). `restart` seul ne relit PAS le .env.
    "${COMPOSE[@]}" up -d --remove-orphans
    ;;
  down)
    "${COMPOSE[@]}" down
    ;;
  logs)
    "${COMPOSE[@]}" logs -f web
    ;;
  *)
    echo "Action inconnue : $ACTION (attendu : up | restart | down | logs)" >&2
    exit 1
    ;;
esac
