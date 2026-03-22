# Guia do Frontend (Atomic Design & State)

O frontend do **SeboStockControl** é construído com **Next.js 15+** (App Router) e segue os princípios de **Atomic Design** para garantir a reutilização e consistência da interface.

## 📂 Estrutura de Componentes (Atomic Design)

Os componentes são organizados no diretório `src/components/` seguindo a seguinte hierarquia:

### 1. `atoms/`
- **O que são:** Elementos base indivisíveis da UI (ex: `Button`, `Input`, `Badge`, `Checkbox`).
- **Regras:** Devem ser puros, altamente reutilizáveis e receber a maior parte de sua configuração via `props`.
- **Exemplo:** [Button.tsx](file:///home/jp/projects/SeboStockControl/frontend/src/components/atoms/button.tsx)

### 2. `molecules/`
- **O que são:** Combinações de dois ou mais átomos que formam uma unidade funcional (ex: `SearchBar`, `FormField`, `UserSearchAutocomplete`).
- **Regras:** Podem conter lógica interna simples de UI, mas devem evitar acessar o estado global diretamente (sempre que possível).
- **Exemplo:** [user-search-autocomplete.tsx](file:///home/jp/projects/SeboStockControl/frontend/src/components/molecules/user-search-autocomplete.tsx)

### 3. `organisms/`
- **O que são:** Seções complexas e funcionais da interface que formam partes distintas de uma página (ex: `Navbar`, `RoleTable`, `UserFormDialog`).
- **Regras:** Podem se comunicar com APIs e gerenciar estados mais complexos, integrando múltiplas moléculas e átomos.
- **Exemplo:** [roles-table.tsx](file:///home/jp/projects/SeboStockControl/frontend/src/components/organisms/roles-table.tsx)

## 🧠 Gerenciamento de Estado

Utilizamos uma abordagem híbrida para garantir performance e simplicidade:

- **Server State:** Gerenciado pelo **TanStack Query** (SWR) para cache de dados da API, sincronização e estados de loading/error.
- **Global UI State:** Usamos **Zustand** para estados globais efêmeros (ex: abrir/fechar modais, filtros globais, preferências de tema).
- **Forms:** Gerenciados via **React Hook Form** com validações garantidas pelo **Zod**.

## 🎨 Estilização e Design System

- **Tailwind CSS:** Para estilização utilitária e responsiva.
- **shadcn/ui:** Base de componentes acessíveis e premium.
- **Glassmorphism:** Estética moderna aplicada a organismos e layouts principais.
- **Dark Mode:** Suporte nativo e inegociável em todos os componentes.

## 🚀 Boas Práticas

- **Colocation:** Mantenha testes (`.spec.tsx`), estilos (`.module.css` se necessário) e tipos auxiliares na mesma pasta do componente.
- **Strict Typing:** Defina explicitamente as `props` de cada componente usando Interfaces TypeScript.
- **Performance:** Utilize `React Server Components (RSC)` sempre que possível e reserve o `"use client"` apenas onde a interatividade for estritamente necessária.

---
*Para dúvidas sobre desenvolvimento, consulte o `CONTRIBUTING.md`.*
