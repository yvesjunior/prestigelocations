#!/usr/bin/env bash
# Raccourcis Git utilisant la clé SSH de l'utilisateur `yves`.
# Le dépôt est cloné en SSH (git@github.com:...), mais les commandes peuvent être
# lancées par un autre utilisateur (ex. root) qui n'a pas la clé. On force donc
# la clé de yves via GIT_SSH_COMMAND pour que l'authentification GitHub passe.
#
# Usage :
#   ./scripts/git.sh pull            # récupère et fusionne origin/<branche courante>
#   ./scripts/git.sh push            # pousse la branche courante vers origin
#   ./scripts/git.sh push -f         # les arguments après l'action sont transmis à git
set -euo pipefail

# Racine du dépôt = dossier parent de scripts/, quel que soit le cwd.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Clé SSH de yves (surchargeable via la variable d'environnement SSH_KEY).
SSH_KEY="${SSH_KEY:-/home/yves/.ssh/id_ed25519}"
KNOWN_HOSTS="/home/yves/.ssh/known_hosts"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "Erreur : clé SSH introuvable ($SSH_KEY). Renseignez SSH_KEY=/chemin/vers/cle." >&2
  exit 1
fi

export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o UserKnownHostsFile=$KNOWN_HOSTS"

ACTION="${1:-pull}"
shift || true  # retire l'action ; le reste ($@) est passé tel quel à git.

case "$ACTION" in
  pull)
    git pull "$@"
    ;;
  push)
    # Pousse la branche courante en créant l'upstream si besoin.
    BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    git push -u origin "$BRANCH" "$@"
    ;;
  *)
    echo "Action inconnue : $ACTION (attendu : pull | push)" >&2
    exit 1
    ;;
esac
