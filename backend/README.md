# SeboStockControl - Backend

API RESTful corporativa para gestão de estoque, desenvolvida com **NestJS**, **Prisma** e **PostgreSQL**.

## 🏗️ Arquitetura

Este projeto segue rigorosamente os princípios de **Clean Architecture** e **DDD**. 
Para detalhes sobre a organização de pastas e padrões de código, consulte:

👉 [**Documentação de Arquitetura do Backend**](../docs/architecture.md)

## 🚀 Como Rodar

### Instalação
```bash
npm install
```

### Configuração
Crie um arquivo `.env` baseado no `.env.example` e configure sua `DATABASE_URL`.

### Execução
```bash
# Desenvolvimento (com hot-reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### Banco de Dados (Prisma)
```bash
# Rodar migrations
npx prisma migrate dev

# Popular o banco (Seed)
npx prisma db seed
```

## 🧪 Testes
```bash
# Unitários
npm run test

# E2E
npm run test:e2e
```

## 📚 API Docs (Swagger)
Quando o servidor estiver rodando, a documentação interativa da API estará disponível em:
`http://localhost:3001/api/docs`

---
*Consulte o [**CONTRIBUTING.md**](../CONTRIBUTING.md) para padrões de desenvolvimento.*
