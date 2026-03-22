# SeboStockControl - Frontend

Interface administrativa moderna para gestão de estoque, desenvolvida com **Next.js 15+**, **React** e **Tailwind CSS**.

## 🎨 Design System & Arquitetura

Utilizamos o padrão **Atomic Design** para estruturar nossos componentes (Atoms, Molecules, Organisms). 
Para detalhes sobre como criar novos componentes e gerenciar o estado, consulte:

👉 [**Guia de Frontend e Atomic Design**](../docs/frontend-guidelines.md)

## 🚀 Como Rodar

### Instalação
```bash
npm install
```

### Configuração
Crie um arquivo `.env.local` baseado no `.env.example` com a URL da API do backend.

### Execução
```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
npm run start
```

## 🧠 Bibliotecas Principais

- **Framework:** Next.js (App Router)
- **UI Components:** shadcn/ui & Radix UI
- **Estilização:** Tailwind CSS (Glassmorphism design)
- **Data Fetching:** TanStack Query (v5)
- **Formulários:** React Hook Form & Zod
- **Estado Global:** Zustand

---
*Consulte o [**CONTRIBUTING.md**](../CONTRIBUTING.md) para padrões de desenvolvimento.*
