#!/usr/bin/env bash
set -e

# ============================================================
#  SeboStockControl — Script de build e inicialização
#  Uso: ./build.sh        (NÃO use sudo!)
#
#  O que este script faz:
#    1. Para containers Docker que estiverem rodando
#    2. Sobe o banco de dados PostgreSQL via Docker
#    3. Instala dependências do backend e frontend
#    4. Cria o arquivo .env se não existir
#    5. Roda as migrations e seed do banco
#    6. Inicia backend e frontend em paralelo
#
#  Para parar tudo depois: Ctrl+C
# ============================================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ---------------------- cores p/ output ----------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # sem cor

step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}  ✔ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail() { echo -e "${RED}  ✖ $1${NC}"; exit 1; }

kill_port() {
  local port="$1"
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
  fi

  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
}

port_in_use() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1 && lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$port" | awk 'NR > 1 { found = 1 } END { exit found ? 0 : 1 }'
    return $?
  fi

  return 1
}

# ---- Impedir execução em shells incompatíveis (sh/dash) ----
if [ -z "$BASH_VERSION" ]; then
  echo "\033[0;31m  ✖ ERRO CRÍTICO: Este script DEVE ser executado em Bash.\033[0m"
  echo "\033[0;33m  Uso correto: ./build.sh ou bash build.sh\033[0m"
  exit 1
fi

# ---- Impedir execução com sudo (causa problemas com nvm) ----
if [ "$(id -u)" -eq 0 ]; then
  echo -e "${RED}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  NÃO rode este script com sudo!                     ║${NC}"
  echo -e "${RED}║  Use apenas: ./build.sh                             ║${NC}"
  echo -e "${RED}║                                                     ║${NC}"
  echo -e "${RED}║  Se o Docker pedir permissão, rode uma vez:         ║${NC}"
  echo -e "${RED}║    sudo usermod -aG docker \$USER                    ║${NC}"
  echo -e "${RED}║  e depois faça logout e login novamente.            ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════╝${NC}"
  exit 1
fi

# ---- Carregar nvm se instalado (Node via nvm) ----------------
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

# ---------------------- verificações -------------------------
command -v docker >/dev/null 2>&1 || fail "Docker não encontrado. Instale em https://docs.docker.com/get-docker/"
command -v node   >/dev/null 2>&1 || fail "Node.js não encontrado. Instale a versão 20+ em https://nodejs.org"
command -v npm    >/dev/null 2>&1 || fail "npm não encontrado. Ele vem junto com o Node.js."

# ---- Verificar se o usuário tem permissão no Docker ----------
if ! docker info >/dev/null 2>&1; then
  echo ""
  echo -e "${YELLOW}  Docker está instalado mas seu usuário não tem permissão.${NC}"
  echo -e "${YELLOW}  Execute este comando UMA VEZ e faça logout/login:${NC}"
  echo ""
  echo -e "    ${CYAN}sudo usermod -aG docker \$USER${NC}"
  echo ""
  fail "Sem permissão para usar o Docker."
fi

# ---------------------- 1. Docker ----------------------------
step "Parando containers anteriores..."
cd "$ROOT_DIR"
docker compose down 2>/dev/null && ok "Containers parados" || ok "Nenhum container rodando"

step "Limpando processos do frontend e backend..."
# Tenta matar processos pelo número da porta (mais comum)
kill_port 3000
kill_port 3001

# Tenta matar todos os processos de 'node' ou 'nest' que estejam rodando nesta pasta
# Excluímos o próprio PID do script ($$) para não nos matarmos
pgrep -f "node.*$ROOT_DIR" | grep -v "$$" | xargs kill -9 2>/dev/null || true
pgrep -f "nest.*$ROOT_DIR" | grep -v "$$" | xargs kill -9 2>/dev/null || true

# Pequeno delay para o SO liberar os sockets e limpar processos
sleep 1

if port_in_use 3000; then
  fail "Porta 3000 ainda em uso. Tente rodar: ss -ltnp 'sport = :3000' para ver quem está usando."
fi

if port_in_use 3001; then
  fail "Porta 3001 ainda em uso. Tente rodar: ss -ltnp 'sport = :3001' para ver quem está usando."
fi
ok "Processos antigos limpos e portas liberadas"

step "Subindo banco de dados PostgreSQL..."
docker compose up -d postgres
ok "PostgreSQL rodando na porta 5432"

# Aguarda o PostgreSQL ficar pronto
step "Aguardando PostgreSQL aceitar conexões..."
for i in $(seq 1 30); do
  if docker exec sebo-postgres pg_isready -U sebo >/dev/null 2>&1; then
    ok "PostgreSQL pronto"
    break
  fi
  if [ "$i" -eq 30 ]; then
    fail "PostgreSQL não ficou pronto em 30 segundos"
  fi
  sleep 1
done

# ---------------------- 2. Backend ---------------------------
step "Instalando dependências do backend..."
cd "$ROOT_DIR/backend"
npm install --silent
ok "Dependências do backend instaladas"

if [ ! -f .env ]; then
  cp .env.example .env
  ok "Arquivo .env criado a partir do .env.example"
else
  ok "Arquivo .env já existe"
fi

step "Rodando migrations do banco de dados..."
npx prisma migrate dev --name init --skip-generate 2>/dev/null || npx prisma migrate deploy 2>/dev/null || warn "Migrations já aplicadas ou banco novo — tentando push..."
npx prisma db push --skip-generate 2>/dev/null || true
npx prisma generate
ok "Schema do banco sincronizado"

step "Populando banco com dados iniciais (seed)..."
npx prisma db seed 2>/dev/null && ok "Seed executado" || warn "Seed já foi executado anteriormente"

step "Fazendo build do backend..."
npm run build
ok "Backend compilado"

# ---------------------- 3. Frontend --------------------------
step "Instalando dependências do frontend..."
cd "$ROOT_DIR/frontend"
npm install --silent
ok "Dependências do frontend instaladas"

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  ok "Arquivo .env.local criado a partir do .env.example"
else
  ok "Arquivo .env.local já existe"
fi

# ---------------------- 4. Iniciar servidores ----------------
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Build concluído com sucesso!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend:   ${CYAN}http://localhost:3001${NC}"
echo ""
echo -e "  Login:     ${YELLOW}admin@admin.com${NC}"
echo -e "  Senha:     ${YELLOW}admin123${NC}"
echo ""
echo -e "  Pressione ${RED}Ctrl+C${NC} para parar tudo."
echo ""

cleanup() {
  echo ""
  step "Parando servidores..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  ok "Servidores parados. Containers Docker continuam rodando."
  echo -e "  Para parar o banco: ${YELLOW}docker compose down${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

cd "$ROOT_DIR/backend"
npm run start:dev &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

wait
