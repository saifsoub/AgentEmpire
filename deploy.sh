#!/bin/bash
set -e

REPO="https://github.com/saifsoub/AgentEmpire"
BRANCH="claude/linear-mcp-http-setup-RNgLY"
DIR="/opt/agent-empire"

echo "==> Deploying AgentEmpire to $DIR"

if [ -d "$DIR/.git" ]; then
  echo "==> Updating existing repo"
  git -C "$DIR" fetch origin
  git -C "$DIR" checkout "$BRANCH"
  git -C "$DIR" pull origin "$BRANCH"
else
  echo "==> Cloning repo"
  git clone -b "$BRANCH" "$REPO" "$DIR"
fi

cd "$DIR"

if [ ! -f .env.local ]; then
  echo "==> Creating .env.local"
  cat > .env.local <<EOF
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
GROQ_API_KEY=${GROQ_API_KEY:-}
COMPOSIO_API_KEY=${COMPOSIO_API_KEY:-}
COMPOSIO_USER_ID=${COMPOSIO_USER_ID:-}
LINEAR_API_KEY=${LINEAR_API_KEY:-}
EOF
  echo "==> .env.local created"
else
  echo "==> .env.local already exists, skipping"
fi

echo "==> Building and starting containers (3-5 min)..."
docker compose up -d --build

echo ""
echo "Done! AgentEmpire is running."
echo "   Dashboard: http://srv1446443.hstgr.cloud"
echo "   Webhook:   http://srv1446443.hstgr.cloud/api/linear-webhook"
echo ""
echo "Next: Set Linear webhook at linear.app/seifs88/settings/api -> Webhooks"
