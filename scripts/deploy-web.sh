#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Install dependencies"
npm ci

echo "==> Build (peut prendre 2-5 min)"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
npm run build

if [ ! -f ".output/server/index.mjs" ]; then
  echo "ERREUR: build incomplet (.output/server/index.mjs manquant)"
  exit 1
fi

echo "==> Restart PM2"
if pm2 describe yolo-frontend >/dev/null 2>&1; then
  pm2 restart ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save
echo "==> OK — écoute sur PORT=${PORT:-8080}"
