---
description: Analisa a estrutura sintáctica e semântica do código-fonte alvo para gerar ou actualizar documentação embutida (*Inline Comments*, *Docstrings*) ou artefactos externos (*README*, *API Specs*), garantindo conformidade com as normas TSDoc/JSDoc.
---

# Workflow: Documentation Generation & Enhancement

## Step 1: Scope & Target Analysis
- Analise o ficheiro activo no editor de texto.
- Determine o escopo da documentação requerida:
  - **Nível de Bloco (Função/Classe):** Foco em assinaturas, injecções de dependência e responsabilidades isoladas.
  - **Nível de Módulo/Projecto:** Foco em topologia, variáveis de ambiente (*Environment Variables*) e instruções de inicialização (`README.md`).
- Avalie a documentação pré-existente. Se presente, a operação é um *Refinement* (correcção de metadados desactualizados). Se ausente, é uma *Creation*.

## Step 2: Standard Compliance & Metadata Extraction
- **Ecossistema TS/JS:** Aplique rigorosamente as directrizes do **TSDoc** (para código TypeScript) ou **JSDoc** (para JavaScript).
- Extraia e documente obrigatoriamente as seguintes anotações:
  - `@param` (Nome, tipo e descrição da intenção da variável).
  - `@returns` (Tipo e descrição do resultado esperado).
  - `@throws` (Excepções ou erros previsíveis lançados pela rotina).
  - `@example` (Para lógicas de alta complexidade algorítmica).
- **APIs (*Backend/NestJS* ou *Next.js Route Handlers*):** Identifique o método HTTP, *Status Codes* (ex: 200, 400, 404), e a estrutura do *Payload* de requisição/resposta.

## Step 3: Generation & Clarity Enforcement
- **Regra da Utilidade:** A documentação deve elucidar o *Porquê* (regra de negócio ou decisão arquitectural) e o *O Quê* (contrato de I/O). Oculte o *Como* se for evidente através da simples leitura do código.
- Elimine comentários do tipo *noise* (ex: `// inicializa a variável`).
- Para gerações de `README.md`, estruture hierarquicamente com blocos de *Installation*, *Configuration* e *Usage*.

## Step 4: Verification & Strict Output
- Assegure-se de que a inserção das *Docstrings* ou comentários não quebra a sintaxe original do código, preservando estritamente a indentação.
- O formato de saída deve consistir exclusivamente no código-fonte actualizado ou no ficheiro Markdown resultante. Oculte explicações conversacionais prévias ou posteriores.