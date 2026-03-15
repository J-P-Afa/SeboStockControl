# SeboStockControl

Sistema web de controle de estoque para loja de Sebo (livros, mangás, etc).

## Tech Stack

- **Backend:** NestJS, Prisma, PostgreSQL, JWT
- **Frontend:** Next.js (App Router), shadcn/ui, Tailwind CSS, TanStack Table
- **Infra:** Docker Compose

## Pré-requisitos

- Node.js >= 20 ([download](https://nodejs.org))
- Docker & Docker Compose ([download](https://docs.docker.com/get-docker/))

## Quick Start (automático)

O jeito mais fácil de rodar o projeto é usando o script de build.
Ele faz tudo automaticamente: para containers antigos, sobe o banco,
instala dependências, roda migrations, seed e inicia os servidores.

**Linux / macOS:**

```bash
./build.sh
```

**Windows:**

```bat
build.bat
```

## Quick Start (manual)

```bash
# 1. Subir o banco de dados
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# 3. Frontend (novo terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Acessos

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

### Credenciais padrão

- **Email:** admin@admin.com
- **Senha:** admin123
