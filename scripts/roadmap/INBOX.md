# INBOX — travail ajouté À CHAUD pendant que la chaîne tourne

Déposé par `roadmap enqueue`. **La chaîne est seule à écrire ici** — elle vide ce fichier au
début de chaque session en reportant les entrées en fin de checklist de PROGRESS.md, puis
les commite. Personne d'autre ne commite ce fichier : c'est ce qui garantit qu'un ajout à
chaud ne peut jamais provoquer de divergence git sous les pieds de la chaîne.

<!-- File vide. Les entrées se déposent sous cette ligne, une par bloc `- [ ]`. -->


- [ ] **Le prévol de roadmap launch doit vérifier que le jeton est VALIDE, pas seulement PRÉSENT**
      _Pourquoi_ : Le 14/08 la chaîne est morte trois fois sur 'Execution error' — 15 octets de log, aucune explication. Cause réelle : 401 OAuth access token has expired. Le prévol lit la présence d'une entrée dans le trousseau macOS et conclut 'jeton de compte présent', donc le lancement s'annonce réussi pendant que chaque fille meurt à la naissance. Un jeton présent n'est pas un jeton valide — c'est la version d'avant, qui faisait un vrai appel, qui l'aurait vu ; elle a été remplacée par une lecture instantanée. Il faut retrouver une sonde qui EXERCE l'authentification (un appel court), quitte à la borner en temps.
      _Déposé le 2026-08-14 01:51_
