# INBOX — travail ajouté À CHAUD pendant que la chaîne tourne

Déposé par `roadmap enqueue`. **La chaîne est seule à écrire ici** — elle vide ce fichier au
début de chaque session en reportant les entrées en fin de checklist de PROGRESS.md, puis
les commite. Personne d'autre ne commite ce fichier : c'est ce qui garantit qu'un ajout à
chaud ne peut jamais provoquer de divergence git sous les pieds de la chaîne.

<!-- File vide. Les entrées se déposent sous cette ligne, une par bloc `- [ ]`. -->

- [ ] **Fiabiliser le watchdog sur la DURÉE : il détecte correctement quand on le lance, mais deux instances longues n'ont jamais alerté sur une chaîne morte**
      _Pourquoi_ : Deux échecs constatés les 12 et 14/08. Lancé à l'instant, il voit la mort en 2 relevés et notifie — le mécanisme est bon. Mais l'instance armée depuis 40 min n'a rien écrit alors que la chaîne était morte depuis 6 min, sans être bloquée (elle dormait normalement dans sa boucle). Piste : le compteur 'morts' est une variable de boucle qu'aucune trace ne montre — il faut journaliser CHAQUE relevé (même vert) pour pouvoir diagnostiquer, et envisager un état sur disque plutôt qu'en mémoire. Un garde dont on ne peut pas prouver qu'il a regardé ne vaut pas mieux qu'aucun garde.
      _Déposé le 2026-08-13 17:12_
