# Mettre la bibliothèque en ligne — le geste unique

Le déploiement courant, lui, est `bin/deploy-site.sh` : il reconstruit et rsync, sans sudo et
sans toucher à la configuration. Ce qui suit ne se fait **qu'une fois**.

## 1. Le DNS (chez le registraire, à la main)

| type | nom | valeur |
|---|---|---|
| A | `visual` | `178.105.231.130` |

Sans cet enregistrement, Caddy ne peut pas obtenir de certificat : le site répondra en erreur
TLS jusqu'à ce qu'il résolve. Caddy réessaie tout seul, il n'y a rien à relancer après coup.

## 2. Le dossier et le vhost (sur le VPS, une fois, en root)

```bash
sudo install -d -o leo -g leo -m 755 /srv/visual-lab
sudo install -m 644 deploy/visual.caddy /etc/caddy/visual.caddy      # déposé au préalable
sudo sed -i '/^import \/etc\/caddy\/code.caddy$/a import /etc/caddy/visual.caddy' /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
```

⚠️ Le bloc global `{ https_port 4443 }` en tête du Caddyfile n'est **pas** négociable : c'est
sslh qui possède le 443 public (accès SSH de secours). Ne jamais l'enlever en déployant.

## 3. Le déploiement, ensuite

```bash
bin/deploy-site.sh
```
