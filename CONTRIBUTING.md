# Guia de Contribuição e Padrões de Engenharia

Este documento define os padrões técnicos inegociáveis para garantir a manutenibilidade, segurança e escalabilidade do **SeboStockControl**.

## 🛠️ Protocolo de Engenharia

### 1. Tipagem Estrita "Schema-First"
- Sempre defina **Schemas (Zod)** e **Interfaces** antes de escrever a implementação lógica.
- Utilize tipagem estrita do TypeScript. Evite `any` ou casts inseguros (`as T`).

### 2. Clean Architecture & DDD (Backend)
- Respeite rigorosamente as camadas:
    - **Domain:** Entidades puras e regras de negócio essenciais. Sem dependências externas.
    - **Application:** Casos de Uso (Use Cases) que coordenam o fluxo de dados.
    - **Infrastructure:** Implementações técnicas (DB, APIs Externas, Mailers).
    - **Presentation:** Controllers, DTOs e Validadores (NestJS).

### 3. Atomic Design (Frontend)
- Estruture a UI dividindo os componentes em:
    - **Atoms:** Componentes base indivisíveis (Button, Input).
    - **Molecules:** Grupos de átomos (FormField, SearchBar).
    - **Organisms:** Seções complexas da página (Navbar, UserTable).

### 4. Padrões de Código (Clean Code)
- **Single Responsibility (SRP):** Cada função deve fazer apenas uma coisa. Limite de **25 linhas** por função.
- **Pureza e Imutabilidade:** Prefira funções puras e utilize o padrão **Copy-on-Write** (não altere objetos diretamente).
- **Result Pattern:** Não use exceções (`throw new Error`) para erros esperados de negócio. Retorne objetos de erro padronizados: `{ success: boolean, data?: T, error?: E }`.
- **Injeção de Dependência:** Sempre receba dependências via construtor ou argumentos para facilitar o Mocking automático em testes.

### 5. Validação e Segurança
- **Zero Alucinação:** Se não houver um tipo definido ou biblioteca instalada, peça permissão antes de inventar uma solução.
- **Runtime Validation:** Todo dado externo (API/DB) deve ser validado via **Parse** no momento da entrada.
- **Hardcoded Secrets:** Nunca deixe credenciais ou chaves no código. Use variáveis de ambiente (`.env`).

### 6. Documentação (Self-Documenting)
- Use nomes de variáveis semânticos e exaustivos; evite abreviações.
- Documente o **porquê** de decisões técnicas complexas usando JSDoc ou comentários específicos.
- Mantenha testes, estilos e tipos auxiliares na mesma pasta do componente que os utiliza (**Colocation**).

---
*Seguir estes padrões é fundamental para manter a saúde do projeto a longo prazo.*
