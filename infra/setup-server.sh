#!/bin/bash
# First-time setup for Hostinger KVM2 (Ubuntu 24.04, Docker pre-installed)
# Run as root from the project root: bash infra/setup-server.sh

set -e

echo "==> Verifying Docker is running..."
docker info > /dev/null 2>&1 || { echo "Docker not running. Start it: systemctl start docker"; exit 1; }

echo "==> Creating Traefik network (if not exists)..."
docker network create traefik 2>/dev/null || echo "  traefik network already exists"

echo "==> Creating .env.local from example..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "  Created .env.local — FILL IN YOUR API KEYS before continuing"
  echo "  Edit with: nano .env.local"
  exit 0
fi

echo "==> Launching app..."
bash infra/deploy.sh

echo ""
echo "==> Setup complete!"
echo "    App: http://srv1446443.hstgr.cloud"
echo "    Logs: docker compose logs -f agent-empire"
