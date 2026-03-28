# Tela de Consulta de Estoques

## Cabeçalho e Filtros Principais
*Tecla Enter em qualquer campo ativa o trigger de Filtrar na tabela abaixo.*

 * **Pesquisa via leitor (ISBN)**: Entry para ISBN10 / ISBN13. Ao ler o código de barras, filtra automaticamente os resultados na tabela.
 * **Pesquisa Inteligente**: Barra de busca por ID, Descrição ou Título da Obra.
 * **Apenas com estoque**: Checkbox. Default: false.
 * **Botão Filtrar**: Aplica os filtros fornecidos à consulta.
 * **Botão Limpar Filtros**: Limpa todos os campos de pesquisa e recarrega a tabela padrão.

---

## Grupo de Filtros Avançados
*Painel auxiliar (pode ser expansível/colapsável) para refinar a busca com maior precisão.*

 * **Classificação**: Select list / Entry.
 * **Editora**: Select list / Entry.
 * **Idioma**: Select list.
 * **Condição (Estado do Livro)**: Select list ("Novo", "Usado", "Todos"). Default: "Todos".
 * **Edição**: Entry.
 * **Volume**: Entry.
 * **Coleção**: Entry.
 * **Apenas ativos**: Checkbox. Default: true.
---

### Tabela de Estoques (Inventário)
*Com paginação, ordenação nativa ao clicar no cabeçalho e scroll horizontal/vertical.*

 * **ID**
 * **Descrição**
 * **ISBN10 / ISBN13**
 * **Condição**
 * **Estoque Atual (Saldo)**
 * **Custo Unitário Base**
 * **Custo Total**
 * **Histórico (Ícone)**: Abre o modal de "Extrato de Movimentações do Livro".
 * **Editar (Ícone)**: Atalho para visualizar/editar as informações de base do livro.

---

### Rodapé de Indicadores de Busca
 * **Total de Títulos**: Label exibindo a contagem distinta de livros encontrados na pesquisa atual.
 * **Total de Exemplares**: Label exibindo o volume total físico em estoque referente à listagem atual.
 * **Exportar Dados**: Botão para exportação dos dados exibidos na grid para formatos analíticos (ex: CSV).

---

### Componentes acessórios

## Modal de Extrato de Movimentações do Livro
### Cabeçalho
 * Informações estáticas do item: ID, Título, Autor(es), ISBN e **Saldo Atual**.

### Tabela de Movimentações (Timeline)
 * **Data/Hora**
 * **Tipo de Transação**: Ex: Entrada (Compra), Entrada (Doação), Saída (Venda), Ajuste de Inventário.
 * **Quantidade**: Valores em formato (+X) para entradas, e (-X) para saídas.
 * **Saldo Pós-Transação**: Mostra como ficou o estoque do livro imediatamente após aquele movimento.
 * **Observação**: Notas ou IDs das notas fiscais ligadas à movimentação.
 * **Responsável**: Usuário que realizou a transação do registro.

 * **Exportar Dados**: Botão para exportação dos dados exibidos na grid para formatos analíticos (ex: CSV).
 * **Botão Fechar**: Encerra o modal e retorna à listagem de Consulta.
