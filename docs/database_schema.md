# DATABASE SCHEMA — Livraria: Estoque & Margem
> Versão 2.3 | Otimizado para geração de código por AI Agent  
> Convenção de nomes: `snake_case` | SGBD-alvo: especificar (recomendado: PostgreSQL 15+)

---

## CONVENTIONS

- `PK` = Primary Key, auto-increment integer (ou UUID — definir antes de implementar)
- `FK` = Foreign Key com `ON DELETE RESTRICT` salvo indicação contrária
- Todas as tabelas possuem campos de auditoria: `created_at`, `updated_at`
- Campos derivados marcados como `GENERATED` devem ser implementados como `GENERATED ALWAYS AS` (computed column) ou resolvidos em View — **nunca atualizados manualmente**
- Campos persistidos por trigger estão marcados como `TRIGGER-MANAGED`
- Regras de negócio estão em blocos `RULE` — o agente deve implementá-las como constraints, triggers ou validações na camada de aplicação conforme indicado

---

## TABELAS DE DOMÍNIO (lookup tables)

### `classificacao`
| Campo       | Tipo         | Constraints         | Descrição               |
|-------------|--------------|---------------------|-------------------------|
| id          | INT          | PK, NOT NULL        |                         |
| descricao   | VARCHAR(100) | NOT NULL, UNIQUE        | Ex: "Ficção", "HQ" |
| ativo       | BOOLEAN      | NOT NULL, DEFAULT TRUE  |                    |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() |                    |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() |                    |

---

### `editora`
| Campo       | Tipo         | Constraints         | Descrição |
|-------------|--------------|---------------------|-----------|
| id          | INT          | PK, NOT NULL        |           |
| descricao   | VARCHAR(150) | NOT NULL, UNIQUE        |           |
| ativo       | BOOLEAN      | NOT NULL, DEFAULT TRUE  |           |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() |           |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() |           |

---

### `idioma`
| Campo       | Tipo        | Constraints         | Descrição              |
|-------------|-------------|---------------------|------------------------|
| id          | INT         | PK, NOT NULL        |                        |
| descricao   | VARCHAR(50) | NOT NULL, UNIQUE        | Ex: "Português", "Inglês" |
| ativo       | BOOLEAN     | NOT NULL, DEFAULT TRUE  |                           |
| created_at  | TIMESTAMP   | NOT NULL, DEFAULT NOW() |                           |
| updated_at  | TIMESTAMP   | NOT NULL, DEFAULT NOW() |                           |

---

### `canal_venda`
| Campo      | Tipo         | Constraints                  | Descrição                        |
|------------|--------------|------------------------------|----------------------------------|
| id         | INT          | PK, NOT NULL                 |                                  |
| descricao  | VARCHAR(100) | NOT NULL, UNIQUE             | Ex: "Shopee", "Site Próprio"     |
| comissao   | DECIMAL(5,4) | NOT NULL, DEFAULT 0.0, CHECK (comissao BETWEEN 0.0 AND 1.0) | Taxa percentual |
| ativo      | BOOLEAN      | NOT NULL, DEFAULT TRUE       |                                  |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()      |                                  |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()      |                                  |

---

### `forma_pagamento`
| Campo      | Tipo         | Constraints                  | Descrição                   |
|------------|--------------|------------------------------|-----------------------------|
| id         | INT          | PK, NOT NULL                 |                             |
| descricao  | VARCHAR(100) | NOT NULL, UNIQUE             | Ex: "Cartão Crédito", "Pix" |
| taxa       | DECIMAL(5,4) | NOT NULL, DEFAULT 0.0, CHECK (taxa BETWEEN 0.0 AND 1.0) | Taxa percentual |
| ativo      | BOOLEAN      | NOT NULL, DEFAULT TRUE       |                             |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()      |                             |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()      |                             |

---

### `tipo_saida`
> Tabela introduzida para distinguir natureza de saídas não-comerciais e evitar contaminação de métricas de margem.  
> `is_venda` desacopla a lógica condicional dos triggers do ID físico do registro — triggers consultam este campo em vez de comparar string ou ID hardcoded.

| Campo      | Tipo        | Constraints             | Descrição                                                        |
|------------|-------------|-------------------------|------------------------------------------------------------------|
| id         | INT         | PK, NOT NULL            |                                                                  |
| descricao  | VARCHAR(50) | NOT NULL, UNIQUE        | Ex: "Venda", "Perda", "Avaria", "Doação", "Devolução Fornecedor" |
| is_venda   | BOOLEAN     | NOT NULL, DEFAULT FALSE | TRUE somente para o tipo "Venda". Controla validações em `saida` |
| ativo      | BOOLEAN     | NOT NULL, DEFAULT TRUE  |                                                                  |
| created_at | TIMESTAMP   | NOT NULL, DEFAULT NOW() |                                                                  |
| updated_at | TIMESTAMP   | NOT NULL, DEFAULT NOW() |                                                                  |

> `RULE [TPS-01]`: Apenas um registro pode ter `is_venda = TRUE`. Implementar via UNIQUE INDEX parcial (`WHERE is_venda = TRUE`) ou constraint na camada de aplicação.

---

## TABELA PRINCIPAL: `livro`

| Campo           | Tipo         | Constraints                                     | Descrição                                              |
|-----------------|--------------|-------------------------------------------------|--------------------------------------------------------|
| id              | INT          | PK, NOT NULL                                    |                                                        |
| id_classificacao| INT          | FK → classificacao.id, NOT NULL                 |                                                        |
| id_editora      | INT          | FK → editora.id, NOT NULL                       |                                                        |
| id_idioma       | INT          | FK → idioma.id, NOT NULL                        |                                                        |
| descricao       | VARCHAR(255) | NOT NULL                                        | Título do livro                                        |
| capa            | VARCHAR(500) | NULLABLE                                        | Path ou URL para storage externo (S3, filesystem). NÃO armazenar blob no banco |
| isbn13          | CHAR(13)     | NULLABLE                                        | Validar formato numérico 13 dígitos. Ver RULE [LIV-02] |
| isbn10          | CHAR(10)     | NULLABLE                                        | Validar formato numérico 10 dígitos. Ver RULE [LIV-02] |
| edicao_especial | VARCHAR(20)  | NOT NULL, CHECK (edicao_especial IN ('normal', 'variante')) | DEFAULT 'normal'                          |
| volume          | VARCHAR(50)  | NULLABLE                                        | Ex: "Vol. 1", "Tomo 2"                                 |
| estado          | VARCHAR(10)  | NOT NULL, CHECK (estado IN ('novo', 'usado'))   |                                                        |
| colecao         | VARCHAR(20)  | NOT NULL, CHECK (colecao IN ('completa', 'em_lancamento')) |                                              |
| peso_gramas     | DECIMAL(8,2) | NULLABLE, CHECK (peso_gramas > 0.0)             | Peso em gramas |
| ativo           | BOOLEAN      | NOT NULL, DEFAULT TRUE                          | Soft delete    |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW()                         |                |
| updated_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW()                         |                |

> `RULE [LIV-01]`: Ao inserir um `livro`, um trigger deve criar automaticamente o registro correspondente em `estoque` com `quantidade = 0`, `custo_unitario_medio = 0.0`, `custo_total = 0.0`.

> `RULE [LIV-02]`: Unicidade de ISBN é **por estado** — o mesmo ISBN pode existir uma vez como `'novo'` e uma vez como `'usado'`. NULLs são excluídos da constraint (livros sem ISBN não conflitam entre si). Implementar via Partial UNIQUE INDEX — **sintaxe PostgreSQL**:
> ```sql
> CREATE UNIQUE INDEX uq_isbn13_novo  ON livro (isbn13) WHERE isbn13 IS NOT NULL AND estado = 'novo';
> CREATE UNIQUE INDEX uq_isbn13_usado ON livro (isbn13) WHERE isbn13 IS NOT NULL AND estado = 'usado';
> CREATE UNIQUE INDEX uq_isbn10_novo  ON livro (isbn10) WHERE isbn10 IS NOT NULL AND estado = 'novo';
> CREATE UNIQUE INDEX uq_isbn10_usado ON livro (isbn10) WHERE isbn10 IS NOT NULL AND estado = 'usado';
> ```

> `RULE [LIV-03]`: BEFORE INSERT em `entrada` ou `saida`, verificar se `livro.ativo = TRUE`. Se não, rejeitar com erro explícito: `"Livro inativo — movimentação não permitida"`.

---

## TABELA: `estoque`

| Campo                | Tipo         | Constraints                          | Descrição                                                          |
|----------------------|--------------|--------------------------------------|--------------------------------------------------------------------|
| id_livro             | INT          | PK, FK → livro.id, NOT NULL          | Relação 1:1 com livro                                              |
| quantidade           | INT          | NOT NULL, DEFAULT 0, CHECK (quantidade >= 0) |                                                            |
| custo_unitario_medio | DECIMAL(12,4)| NOT NULL, DEFAULT 0.0, CHECK (custo_unitario_medio >= 0) | Ver algoritmo WACC abaixo        |
| custo_total          | DECIMAL(14,4)| GENERATED: (quantidade * custo_unitario_medio) | Computed column — não atualizar manualmente          |
| created_at           | TIMESTAMP    | NOT NULL, DEFAULT NOW()              |                                                                    |
| updated_at           | TIMESTAMP    | NOT NULL, DEFAULT NOW()              |                                                                    |

### ALGORITMO: Custo Médio Ponderado (WACC) — OBRIGATÓRIO implementar
```
// Executado via trigger AFTER INSERT em `entrada`

IF entrada.valor_unitario = 0 THEN
    // Doação recebida: incrementa quantidade sem alterar custo médio
    estoque.quantidade += entrada.quantidade
ELSE
    novo_custo_medio = (
        (estoque.quantidade * estoque.custo_unitario_medio) + (entrada.quantidade * entrada.valor_unitario)
    ) / (estoque.quantidade + entrada.quantidade)

    estoque.custo_unitario_medio = novo_custo_medio
    estoque.quantidade += entrada.quantidade
END IF
```

> `RULE [EST-01]`: `custo_unitario_medio` NÃO é resetado quando o estoque chega a zero. O último valor é mantido como referência até a próxima entrada.  
> `RULE [EST-02]`: `custo_total` deve ser `GENERATED ALWAYS AS (quantidade * custo_unitario_medio)` se o SGBD suportar. Caso contrário, atualizado por trigger junto com `quantidade`.

---

## TABELA: `entrada`

| Campo          | Tipo         | Constraints                                       | Descrição                              |
|----------------|--------------|---------------------------------------------------|----------------------------------------|
| id             | INT          | PK, NOT NULL                                      |                                        |
| id_livro       | INT          | FK → livro.id, NOT NULL                           |                                        |
| data           | DATE         | NOT NULL, CHECK (data <= CURRENT_DATE)            |                                        |
| quantidade     | INT          | NOT NULL, CHECK (quantidade > 0)                  |                                        |
| valor_unitario | DECIMAL(12,4)| NOT NULL, CHECK (valor_unitario >= 0)             | Custo unitário desta entrada. = 0 para doações recebidas |
| valor_total    | DECIMAL(14,4)| GENERATED: (quantidade * valor_unitario)          | Computed column                        |
| observacao     | TEXT         | NULLABLE                                          | Ex: "Reposição NF 4521"                |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW()                           |                                        |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW()                           |                                        |

> `RULE [ENT-01]`: AFTER INSERT, executar o algoritmo WACC em `estoque` (ver acima). Toda a operação deve estar em uma única transação — em caso de falha, o INSERT em `entrada` deve ser revertido (ROLLBACK).

---

## TABELA: `saida`

| Campo                        | Tipo         | Constraints                                                                 | Descrição                                                                 |
|------------------------------|--------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------|
| id                           | INT          | PK, NOT NULL                                                                |                                                                           |
| id_livro                     | INT          | FK → livro.id, NOT NULL                                                     |                                                                           |
| id_tipo_saida                | INT          | FK → tipo_saida.id, NOT NULL, DEFAULT (SELECT id FROM tipo_saida WHERE is_venda = TRUE LIMIT 1) | Default = registro "Venda". Ver RULE TPS-01      |
| id_canal_venda               | INT          | FK → canal_venda.id, NULLABLE                                               | Obrigatório se `tipo_saida.is_venda = TRUE`                               |
| id_forma_pagamento           | INT          | FK → forma_pagamento.id, NULLABLE                                           | Obrigatório se `tipo_saida.is_venda = TRUE`                               |
| data                         | DATE         | NOT NULL, DEFAULT CURRENT_DATE, CHECK (data <= CURRENT_DATE)                |                                                                           |
| quantidade                   | INT          | NOT NULL, CHECK (quantidade > 0)                                            |                                                                           |
| valor_unitario               | DECIMAL(12,4)| NOT NULL, CHECK (valor_unitario >= 0)                                       | = 0 se não for venda; > 0 se for venda                                   |
| valor_total                  | DECIMAL(14,4)| GENERATED: (quantidade * valor_unitario)                                    | Computed column                                                           |
| snapshot_custo_unitario      | DECIMAL(12,4)| NOT NULL, TRIGGER-MANAGED                                                   | Copiado de `estoque.custo_unitario_medio` no momento da saída             |
| snapshot_custo_total         | DECIMAL(14,4)| GENERATED: (quantidade * snapshot_custo_unitario)                           | Computed column                                                           |
| snapshot_comissao_plataforma | DECIMAL(5,4) | NOT NULL, DEFAULT 0.0, TRIGGER-MANAGED                                      | Copiado de `canal_venda.comissao`; = 0 se não for venda                  |
| valor_comissao_plataforma    | DECIMAL(14,4)| GENERATED: (valor_total * snapshot_comissao_plataforma)                     | Computed column                                                           |
| snapshot_taxa_pagamento      | DECIMAL(5,4) | NOT NULL, DEFAULT 0.0, TRIGGER-MANAGED                                      | Copiado de `forma_pagamento.taxa`; = 0 se não for venda                  |
| valor_taxa_pagamento         | DECIMAL(14,4)| GENERATED: (valor_total * snapshot_taxa_pagamento)                          | Computed column                                                           |
| lucro_venda                  | DECIMAL(14,4)| GENERATED: (valor_total - snapshot_custo_total - valor_comissao_plataforma - valor_taxa_pagamento) | Computed column. Negativo para saídas não-venda = perda contábil correta |
| observacao                   | TEXT         | NULLABLE                                                                    |                                                                           |
| created_at                   | TIMESTAMP    | NOT NULL, DEFAULT NOW()                                                     |                                                                           |
| updated_at                   | TIMESTAMP    | NOT NULL, DEFAULT NOW()                                                     |                                                                           |

### RULES

> `RULE [SAI-01]`: BEFORE INSERT, verificar se `estoque.quantidade >= saida.quantidade`. Se não, rejeitar com erro explícito: `"Estoque insuficiente"`.  
> `RULE [SAI-02]`: Se `tipo_saida.is_venda = TRUE`: `id_canal_venda` NOT NULL, `id_forma_pagamento` NOT NULL, `valor_unitario > 0`.  
> `RULE [SAI-03]`: Se `tipo_saida.is_venda = FALSE`: `valor_unitario = 0`, `id_canal_venda = NULL`, `id_forma_pagamento = NULL`.  
> `RULE [SAI-04]`: AFTER INSERT, decrementar `estoque.quantidade`. Toda a operação em transação única — ROLLBACK em caso de falha.  
> `RULE [SAI-05]`: Os campos `snapshot_*` devem ser preenchidos por trigger BEFORE INSERT, copiando os valores atuais das tabelas de referência. Isso garante imutabilidade histórica. Se `is_venda = FALSE`, `snapshot_comissao_plataforma = 0` e `snapshot_taxa_pagamento = 0`.

---

## DIAGRAMA DE DEPENDÊNCIAS (resumido)

```
classificacao ─┐
editora        ├──► livro ──► estoque
idioma         ┘       │
                       ├──► entrada
                       │
                       └──► saida ──► canal_venda
                                  └──► forma_pagamento
                                  └──► tipo_saida
```

---
