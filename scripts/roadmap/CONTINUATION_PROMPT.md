# PROMPT DE REPRISE AUTONOME — visual-lab, solder la roadmap du corpus

Tu es Claude Code, **sur la machine du mainteneur** (macOS), dans le dépôt visual-lab —
tu y es déjà : le lanceur t'a placé à sa racine. Tu fais avancer
la roadmap du corpus jusqu'au bout, en autonomie, en te relançant en session fraîche à chaque step
pour garder ta fenêtre de contexte propre.

**Ce dépôt n'est pas un cache jetable.** C'est le dépôt réel, sur le poste réel, et une autre
session — celle du mainteneur — peut travailler dedans en même temps. Deux interdits absolus qui
en découlent, et qui diffèrent du gabarit habituel de ce kit :

- **jamais `git reset --hard`** — tu détruirais du travail non poussé, y compris celui d'un autre ;
- **jamais `git add -A` ni `git add .`** — le commit NOMME ses chemins. C'est la doctrine du dépôt
  et elle a été payée : un `-A` a déjà emporté le travail en cours d'une session parallèle.

## Boucle

1. **Charge l'état.** Dans l'ordre, sans en sauter :
   ```bash
   git pull --ff-only origin main    # si ÉCHEC : divergence → STATE: BLOCKED, halt
   ```
   Puis lis, dans cet ordre : `SKILL.md` (le manuel opérateur — il porte l'ordre des gestes et les
   pièges déjà payés), `scripts/roadmap/PROGRESS.md` (l'état vivant), et la section du lot visé
   dans `SPEC-SOURCES.md` + `ROADMAP.md`.
   **Reprise mi-step** : si « Checkpoint intra-step » porte des cases cochées, la session
   précédente a passé la main en cours de route. Le travail coché est déjà commité (`wip(…)`).
   Reprends à la première sous-tâche NON cochée — ne refais pas le step depuis zéro.

2. **Fais UN seul step** : le premier `[ ]` depuis `CURRENT_STEP`.
   Si le step comporte plusieurs gestes, écris d'abord sa sous-checklist dans « Checkpoint
   intra-step » (`CHECKPOINT_STEP: <step>` + une case par sous-tâche), commit+push. Puis après
   CHAQUE sous-tâche : coche, puis
   ```bash
   git add <chemins précis> && git commit -m "wip(<step>): <sous-tâche>" && git push origin main
   ```
   Les commits `wip` n'ont pas besoin du gate — il ne conditionne que le commit FINAL du step.

3. **Gate AVANT le commit final** (obligatoire, ~90 s) :
   ```bash
   node bin/index.mjs && node bin/check.mjs && node bin/check-deck.mjs
   ```
   Rouge et non réparable proprement dans l'itération ⇒ reverte le step, `STATE: BLOCKED` + la
   raison dans le journal, halt (n'appelle pas next.sh).

4. **REGARDE ton rendu.** Le gate dit que la géométrie est juste, pas que c'est juste.
   `node bin/render.mjs --pattern <id>` (ou `bin/slides.mjs` pour un deck), **ouvre le PNG**,
   compare à la spec, corrige. Puis `rm -rf proofs` : ces images sont ton instrument de mesure,
   jamais un livrable. La vue du mainteneur est `gallery.html` et les decks — tu ne lui livres
   aucune image, jamais.

5. **Commit final + push**, chemins nommés, doc à jour DANS le même commit (README « État »,
   ROADMAP, DOCTRINE si une loi bouge) :
   ```bash
   git add SPEC-SOURCES.md ROADMAP.md README.md systems/<ref>.json decks/<ref>.html \
           patterns/<id>.json patterns/<id>.html INDEX.md index.json gallery.html
   git commit -m "…"    # message qui dit ce que ça CHANGE, pas ce que ça ajoute
   git push origin main
   ```
   Puis mets à jour `PROGRESS.md` : coche `[x]`, avance `CURRENT_STEP`, ligne de journal en haut,
   stampe `UPDATED`, `LAST_COMMIT`, et remets `CHECKPOINT_STEP: (aucun)`. Pousse aussi cette MAJ.

6. **Relance-toi en session fraîche** — en TOUT DERNIER geste, et **seulement si `STATE: RUNNING`** :
   ```bash
   bash scripts/roadmap/next.sh
   ```
   Tu termines ta réponse là. Tout ton état durable est en git + PROGRESS.md.
   **N'appelle PAS next.sh** si STATE vaut `AWAITING_DECISION`, `BLOCKED`, `DONE` ou `STOPPED`.
   `STOPPED` est posé par `roadmap stop` : c'est le mainteneur qui a coupé, on ne relance jamais.

## Garde de fenêtre de contexte — APRÈS CHAQUE SOUS-TÂCHE

`bash scripts/roadmap/ctx-guard.sh` dit si tu dois passer la main **maintenant**, sans attendre la
fin du step. Ce n'est pas optionnel : un lot de 12 slides ne tient pas dans une fenêtre, et une
session qui meurt saturée fait refaire son travail à la suivante.

- `OK` → tu enchaînes ;
- `HANDOFF` → tu passes la main immédiatement, même au milieu du step : coche les sous-tâches
  réellement faites, `git add <chemins> && git commit -m "wip(<step>): …" && git push origin main`,
  puis `bash scripts/roadmap/next.sh` — et tu TERMINES ta réponse là.

Écrire le checkpoint AVANT `next.sh` n'est pas négociable : c'est lui, et lui seul, qui empêche la
session suivante de refaire ce qui est fait.

## Ce qui fait la qualité d'un lot ici

Le détail complet est dans `SKILL.md` (« VERSER »), que tu as lu à l'étape 1. Les cinq points sur
lesquels les lots précédents ont réellement échoué :

1. **Écrire la spec AVANT le code.** L'image source n'existe souvent pas sur disque —
   `SPEC-SOURCES.md` la REMPLACE et fait foi. Un lot sans image se fait quand même (les douze
   premiers l'ont été) ; ce qui change, c'est que `bin/diff.mjs` est impossible : le contrôle de
   fidélité se limite alors au regard et à `check-deck.mjs`. Dis-le dans le commit.
2. **Compter les couches, et savoir en retirer.** Trois au grand maximum (fond → panneau →
   module). Quand deux couches encadrent la même chose, il n'y en a qu'UNE, et c'est celle du
   dessus qu'on garde. Aucun alignement ne casse quand on en empile une de trop : rien ne le
   signalera à ta place, sauf `bin/check-deck.mjs`.
3. **N'ajoute AUCUN élément absent de la source.** Deux halos inventés « pour donner de la
   matière » ont coûté une reprise complète. Si tu crois qu'il en faut un, c'est une frontière.
4. **Les ratios s'ancrent sur la largeur de SLIDE**, jamais sur un objet interne — un objet
   interne disparaît à la première correction et emporte toutes les extractions avec lui.
5. **Le contraste d'un relevé se vérifie avant d'être recopié.** Trois lots de suite, la source
   plaçait son gris secondaire juste SOUS 4,5:1. La bibliothèque ne capitalise pas le défaut de
   la source : on corrige et on le note.

## Frontière = décision du mainteneur

Quand un step est marqué FRONTIÈRE, ou qu'une décision de forme non déductible se présente
(la spec est muette ou se contredit sur un point structurant, un élément absent de la source
semble nécessaire) : **NE code pas, N'appelle PAS next.sh.** Écris un tableau markdown dans
`DECISIONS_PENDING.md` — `| # | Décision | Options | Reco | Enjeu |`, numéroté, avec TOUJOURS une
reco par défaut pour qu'il puisse répondre « go reco 1 » — mets `STATE: AWAITING_DECISION`,
commit + push, et arrête-toi en laissant le tableau comme dernier message.

Ce qui n'est PAS une frontière : une image source absente (la spec fait foi), un choix de nommage
(`bin/new.mjs` tranche), un doute sur l'utilité d'un pattern (dans le doute, on ne le garde pas).

Objectif : dérouler la checklist jusqu'à `STATE: DONE`, sans intervention, en ne s'arrêtant qu'aux
vraies décisions.
