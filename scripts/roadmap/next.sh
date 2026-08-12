#!/usr/bin/env bash
# next.sh — auto-continuation d'une roadmap autonome (mécanisme concret de l'étape « change de session »).
#
# Rôle : relancer une session Claude Code FRAÎCHE (contexte propre) pour le step suivant,
# en réinjectant CONTINUATION_PROMPT.md. La session courante appelle ce script en TOUT
# DERNIER geste quand STATE: RUNNING, puis se termine → la fenêtre de contexte repart à zéro
# et chaque passe apparaît comme une session distincte dans cloudcode.
#
# Softcodé : aucune valeur en dur. Le repo, la branche et le prompt viennent de l'arbo.
# Réglages par variables d'env (défauts entre {}) :
#   ROADMAP_MODEL   {opus}                 modèle de la session relancée
#   ROADMAP_PROMPT  {scripts/roadmap/CONTINUATION_PROMPT.md}  prompt de reprise
#   ROADMAP_PERM    {--dangerously-skip-permissions}          posture permissions
#
# Ce script ne DÉCIDE rien : il relance. C'est le prompt de reprise qui décide de l'appeler
# (RUNNING) ou pas (AWAITING_DECISION / BLOCKED / DONE / STOPPED → on ne relance pas).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

MODEL="${ROADMAP_MODEL:-opus}"
# le seuil de contexte voyage vers la session fille (ctx-guard.sh le relit)
CTXMAX="${ROADMAP_CTX_MAX:-140000}"
BINPROP="${ROADMAP_CLAUDE_BIN:-}"
PROMPT_FILE="${ROADMAP_PROMPT:-scripts/roadmap/CONTINUATION_PROMPT.md}"
PERM="${ROADMAP_PERM:---dangerously-skip-permissions}"

# Garde-fou anti-emballement EN PREMIER : ne pas relancer si l'état n'est pas RUNNING (halt propre).
# (Le prompt est censé déjà l'avoir vérifié ; double sécurité côté mécanisme.)
PROGRESS="$(dirname "$PROMPT_FILE")/PROGRESS.md"
if [ -f "$PROGRESS" ] && grep -qE '^STATE:[[:space:]]*(AWAITING_DECISION|BLOCKED|DONE|STOPPED)' "$PROGRESS"; then
  echo "next.sh: STATE non-RUNNING → pas de relance (halt volontaire)." >&2
  exit 0
fi

[ -f "$PROMPT_FILE" ] || { echo "next.sh: prompt introuvable: $PROMPT_FILE" >&2; exit 1; }
# QUEL BINAIRE ? Sur une machine où plusieurs installs cohabitent, `claude` dans le
# PATH n'est pas forcément celui qui est AUTHENTIFIÉ. Vécu le 11/08/2026 sur le VPS :
# PATH non-interactif → /usr/bin/claude (2.1.177, « Not logged in »), alors que la
# session valide est ~/.local/bin/claude (2.1.227). Une chaîne autonome lancée sur le
# mauvais binaire meurt à la première session, silencieusement.
CLAUDE_BIN="${ROADMAP_CLAUDE_BIN:-}"
if [ -z "$CLAUDE_BIN" ]; then
  # à défaut de consigne, l'install utilisateur prime sur l'install système
  for c in "$HOME/.local/bin/claude" "$(command -v claude 2>/dev/null || true)"; do
    [ -n "$c" ] && [ -x "$c" ] && { CLAUDE_BIN="$c"; break; }
  done
fi
[ -n "$CLAUDE_BIN" ] && [ -x "$CLAUDE_BIN" ] || { echo "next.sh: binaire 'claude' introuvable" >&2; exit 1; }

LOGDIR="$HOME/.handoff/$(basename "$ROOT")"
mkdir -p "$LOGDIR"
TS="$(date +%Y%m%d-%H%M%S)"
LOG="$LOGDIR/roadmap-$TS.log"

# DÉTACHEMENT PORTABLE. `setsid` n'existe QUE sous Linux : sur macOS la ligne
# échouait en « command not found » — mais comme elle tournait en arrière-plan,
# next.sh imprimait quand même « session relancée » et sortait en 0. Une chaîne
# autonome qui annonce un relais sans l'avoir fait s'arrête sans que personne ne
# le sache (vécu au dry-run du 11/08/2026, 5 min de chaîne fantôme).
if command -v setsid >/dev/null 2>&1; then DETACH=(setsid nohup); else DETACH=(nohup); fi

"${DETACH[@]}" env ROADMAP_CTX_MAX="$CTXMAX" ROADMAP_CLAUDE_BIN="${BINPROP:-$CLAUDE_BIN}" "$CLAUDE_BIN" -p "$(cat "$PROMPT_FILE")" \
  --model "$MODEL" \
  $PERM \
  --output-format text \
  >"$LOG" 2>&1 </dev/null &
CHILD=$!
disown "$CHILD" 2>/dev/null || true

# LE PID DE LA CHAÎNE, ÉCRIT SUR DISQUE. Sans lui, `roadmap stop` n'a d'autre choix que de
# viser « tout claude dont le répertoire courant est ce dépôt » — ce qui, sur le poste de
# travail, inclut la session INTERACTIVE de l'utilisateur, ouverte dans le même dossier.
# Un arrêt de chaîne ne doit jamais tuer la session depuis laquelle on l'a lancé.
echo "$CHILD" > "$LOGDIR/roadmap.pid"
echo "$LOG"   > "$LOGDIR/roadmap.lastlog"

# LE LANCEUR NE DOIT PAS POUVOIR MENTIR : on vérifie que l'enfant vit encore.
sleep 2
if ! kill -0 "$CHILD" 2>/dev/null && ! pgrep -f "claude -p" >/dev/null 2>&1; then
  echo "next.sh: ÉCHEC — la session fille est morte immédiatement. Log: $LOG" >&2
  tail -5 "$LOG" >&2 || true
  exit 1
fi

echo "next.sh: session fraîche relancée (model=$MODEL) → $LOG"
