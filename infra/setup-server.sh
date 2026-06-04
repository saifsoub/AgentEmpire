#!/bin/bash
# First-time server setup for Ubuntu/Debian on Hostinger KVM2
# Run as root: bash infra/setup-server.sh

set -e

echo "==> Installing Node.js 20 via nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

echo "==> Installing PM2..."
npm install -g pm2
pm2 startup

echo "==> Installing nginx..."
apt-get update -y
apt-get install -y nginx

echo "==> Configuring nginx..."
cp /root/AgentEmpire/infra/nginx.conf /etc/nginx/sites-available/agent-empire
ln -sf /etc/nginx/sites-available/agent-empire /etc/nginx/sites-enabled/agent-empire
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Setup complete. Now run: bash infra/deploy.sh"
