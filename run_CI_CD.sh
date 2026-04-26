#!/usr/bin/env bash
set -euo pipefail

# Emulates .github/workflows/ci.yml locally.
# Requirements: Node.js 20+, npm, and network access for npm/Playwright installs.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

step() {
  echo -e "\n${CYAN}==> $1${NC}"
}

ok() {
  echo -e "${GREEN}OK:${NC} $1"
}

fail() {
  echo -e "${RED}ERROR:${NC} $1"
  exit 1
}

run() {
  echo "+ $*"
  "$@"
}

command -v node >/dev/null 2>&1 || fail "Node.js is not installed."
command -v npm >/dev/null 2>&1 || fail "npm is not installed."

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js 20+ is required. Current version: $(node --version)"
fi

step "Frontend CI: install dependencies"
cd "$ROOT_DIR/frontend"
run npm ci

step "Frontend CI: lint"
run npm run lint

step "Frontend CI: type-check"
run npm run type-check

step "Frontend CI: Vitest coverage"
run npm run test:coverage

step "Frontend CI: install Playwright Chromium"
run npx playwright install --with-deps chromium

step "Frontend CI: build"
run npm run build

step "Frontend CI: Playwright E2E"
CI=true run npm run test:e2e
ok "Frontend CI completed"

step "Backend CI: install dependencies"
cd "$ROOT_DIR/backend"
run npm ci

step "Backend CI: generate Prisma client"
run npx prisma generate

step "Backend CI: lint"
run npm run lint

step "Backend CI: unit tests with coverage"
run npm run test:cov
ok "Backend CI completed"

echo -e "\n${GREEN}Local CI/CD emulation completed successfully.${NC}"
