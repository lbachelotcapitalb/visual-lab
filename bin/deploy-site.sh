#!/usr/bin/env bash
# Publie la bibliothèque sur https://visual.capitalb.fr.
#
# Ne fait AUCUN sudo et ne touche à aucune configuration : le provisionnement (le dossier
# /srv/visual-lab et le vhost Caddy) est un geste UNIQUE, décrit dans deploy/PROVISION.md.
# Ici on ne fait que reconstruire et recopier — donc c'est rejouable sans risque.
set -euo pipefail
HOST="${VL_HOST:-vps}"
DEST="${VL_DEST:-/srv/visual-lab}"
cd "$(dirname "$0")/.."

echo "→ index + site"
node bin/index.mjs >/dev/null
node bin/site.mjs

echo "→ rsync vers $HOST:$DEST"
# rsync 2.6.9 (celui d'Apple) ignore --info : on reste sur des options que les deux versions
# comprennent, sinon le déploiement casse selon la machine d'où on le lance.
rsync -az --delete site/ "$HOST:$DEST/"
ssh "$HOST" "find $DEST -type f | wc -l | tr -d ' ' | xargs -I{} echo '   {} fichiers en place'; du -sh $DEST | cut -f1 | xargs -I{} echo '   {} sur disque'"

echo "→ contrôle"
curl -fsS -o /dev/null -w '   HTTP %{http_code} en %{time_total}s — %{url_effective}\n' \
  https://visual.capitalb.fr/ \
  || echo '   ⚠ le site ne répond pas encore (DNS ou certificat) — voir deploy/PROVISION.md'
