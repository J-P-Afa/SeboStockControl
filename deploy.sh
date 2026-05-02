#!/bin/bash
set -euo pipefail

# ==============================================================================
# Script de Deploy Automatizado com Build Local Otimizado (SeboStockControl)
# ==============================================================================

EC2_HOST="ec2-54-75-13-44.eu-west-1.compute.amazonaws.com"
EC2_USER="ubuntu"
PEM_FILE="SeboStockControl.pem"
TARGET_DIR="~/app"

DATABASE_URL="postgresql://sebo:sebo_secret@postgres:5432/sebo_stock?schema=public"
JWT_SECRET="gere-um-segredo-forte-aqui-em-producao-123456"
NEXT_PUBLIC_API_URL="/api"

echo "🚀 Iniciando deploy seguro para $EC2_HOST..."

if [ ! -f "$PEM_FILE" ]; then
    echo "❌ Erro: Chave $PEM_FILE não encontrada!"
    exit 1
fi
chmod 400 "$PEM_FILE"

echo "🏗️  Construindo as imagens Docker OTIMIZADAS localmente..."
export DOCKER_DEFAULT_PLATFORM=linux/amd64
docker build --platform linux/amd64 -t sebostockcontrol-backend:latest ./backend
docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" -t sebostockcontrol-frontend:latest ./frontend

echo "📦 Compactando imagens (Tamanho estimado: ~170MB)..."
docker save sebostockcontrol-backend:latest sebostockcontrol-frontend:latest | gzip > app_images.tar.gz

echo "📤 Enviando imagens e docker-compose para o servidor AWS..."
rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no -i $PEM_FILE" \
    app_images.tar.gz docker-compose.yml nginx.conf \
    ${EC2_USER}@${EC2_HOST}:${TARGET_DIR}/

echo "⚙️  Acessando servidor remoto para aplicar a atualização..."
ssh -o StrictHostKeyChecking=no -i "$PEM_FILE" ${EC2_USER}@${EC2_HOST} << EOF
    cd ${TARGET_DIR}

    echo "🔐 Configurando variáveis..."
    echo "DATABASE_URL=\"${DATABASE_URL}\"" > .env
    echo "JWT_SECRET=\"${JWT_SECRET}\"" >> .env
    echo "NEXT_PUBLIC_API_URL=\"${NEXT_PUBLIC_API_URL}\"" >> .env

    echo "📥 Carregando novas imagens Docker..."
    docker load -i app_images.tar.gz

    echo "🐳 Reiniciando contêineres..."
    docker compose up -d

    echo "🗃️  Aplicando migrations do banco..."
    docker compose exec -T backend npx prisma migrate deploy

    echo "🧹 Limpeza de arquivos de instalação e cache antigo..."
    rm app_images.tar.gz
    docker image prune -a -f
EOF

echo "🗑️  Limpando arquivos temporários locais..."
rm app_images.tar.gz

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse o Frontend em: http://${EC2_HOST}:3000"
echo "🔌 Acesse o Backend API em: http://${EC2_HOST}:3000/api"
