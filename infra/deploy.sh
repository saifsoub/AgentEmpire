#!/bin/bash
# Deploy script for Hostinger KVM2 VPS
# Run once on the server after cloning: bash infra/deploy.sh
# For subsequent deploys: bash infra/deploy.sh

set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies..."
npm ci --omit=dev

echo "==> Building Next.js app..."
npm run build

echo "==> Creating data directory..."
mkdir -p var

echo "==> Restarting via PM2..."
pm2 restart agent-empire 2>/dev/null || pm2 start ecosystem.config.js

pm2 save

echo "==> Done. App running at http://$(hostname -I | awk '{print $1}'):3000"
