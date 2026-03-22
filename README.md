# SeboStockControl

Sistema corporativo de controle de estoque para lojas de Sebo (livros, mangás, colecionáveis). Desenvolvido com foco em **Clean Architecture**, **DDD** e **Atomic Design**.

## 🚀 Visão Geral

Este projeto é uma solução full-stack moderna que utiliza tecnologias de ponta para garantir escalabilidade, manutenibilidade e uma experiência de usuário premium.

### 🛠 Tech Stack

- **Linguagem:** TypeScript (Strict Mode)
- **Backend:** [NestJS](https://nestjs.com/) (Clean Architecture & CQRS)
- **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router & React Server Components)
- **Persistência:** [Prisma ORM](https://www.prisma.io/) & PostgreSQL
- **Estilização:** Tailwind CSS & shadcn/ui (Premium Aesthetics)
- **Estado/Dados:** TanStack Query, Zustand, Zod (Schema Validation)
- **Infra:** Docker & Docker Compose

## 📖 Documentação de Engenharia

Para entender profundamente as decisões arquiteturais e padrões de código, consulte:

1. [**Arquitetura do Backend (Clean Arch & DDD)**](docs/architecture.md)
2. [**Guia do Frontend (Atomic Design & State)**](docs/frontend-guidelines.md)
3. [**Guia de Contribuição & Padrões**](CONTRIBUTING.md)

## 🏁 Quick Start

### Pré-requisitos
- Node.js >= 20
- Docker & Docker Compose

### Instalação Automática (Recomendado)
O script de build automatiza todo o processo de setup, banco de dados e inicialização.

```bash
# Linux / macOS
chmod +x build.sh
./build.sh

# Windows
build.bat
```

### Instalação Manual
Caso prefira o controle manual:

1. **Infraestrutura:** `docker compose up -d`
2. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run start:dev
   ```
3. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

## 🔐 Acessos

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend (API):** [http://localhost:3001](http://localhost:3001)
- **Swagger UI:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs) (se ativado)

### Credenciais Admin
- **Email:** `admin@admin.com`
- **Senha:** `admin123`
