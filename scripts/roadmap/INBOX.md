# INBOX — travail ajouté À CHAUD pendant que la chaîne tourne

Déposé par `roadmap enqueue`. **La chaîne est seule à écrire ici** — elle vide ce fichier au
début de chaque session en reportant les entrées en fin de checklist de PROGRESS.md, puis
les commite. Personne d'autre ne commite ce fichier : c'est ce qui garantit qu'un ajout à
chaud ne peut jamais provoquer de divergence git sous les pieds de la chaîne.

<!-- File vide. Les entrées se déposent sous cette ligne, une par bloc `- [ ]`. -->

- [ ] **Commiter next.sh (superviseur de survie + détachement réel) en même temps que S12**
      _Pourquoi_ : Deux apports non commités s'y superposent : le superviseur qui replanifie une reprise après une limite de service, et le détachement réel — nohup ne protège que du SIGHUP, pas d'un kill de groupe, et c'est ce qui a tué le watchdog en silence après 4 h le 12/08. Tant que ce n'est pas commité, un clone repart avec un lanceur qui meurt avec sa session.
      _Déposé le 2026-08-13 16:30_

- [ ] **Faire relancer la chaîne par le superviseur sur une Execution error, pas seulement sur une limite de service**
      _Pourquoi_ : La chaîne est morte le 12/08 à 23:58 sur un log de 15 octets contenant 'Execution error' — pas un gate rouge, pas une limite : une erreur du CLI. Le superviseur ne reconnaît que les phrases de limite, donc il n'aurait pas repris. Une erreur transitoire qui laisse STATE=RUNNING et aucune session vivante mérite au moins UNE reprise, avec le même anti-boucle.
      _Déposé le 2026-08-13 16:30_
