#!/bin/bash
# Deploy script — Hostinger KVM2 (Docker + Traefik)
# Run from the project root: bash infra/deploy.sh

set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building and restarting container..."
docker compose up -d --build

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Done. Check status:"
docker compose ps
