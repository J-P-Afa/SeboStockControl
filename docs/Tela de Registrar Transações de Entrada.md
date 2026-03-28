# Tela de Registrar Transações de Entrada

## Cabeçalho da Transação (Campos comuns para todos os itens da sessão)
 * **Tipo de Entrada**: Select list ("Compra", "Doação Recebida"). Default: "Compra".
 * **Data**: Entry (Default: hoje).
 * **Observação**: Entry (Texto livre para notas da nota fiscal, doador, etc.)

---

## Grupo de inserção via leitor
*Tecla Enter em qualquer campo ativa o trigger de Salvar na tabela abaixo.*

 * **Inserir via leitor**: Entry para ISBN10 / ISBN13. Ao ler, altera o foco para o próximo campo. Caso o ISBN não esteja cadastrado, abre o modal de cadastro.
 * **Descrição do Livro**: Label preenchido automaticamente ao carregar o ISBN.
 * **Estoque Atual**: Label exibindo o saldo atual do livro.
 * **Quantidade**: Entry (Default: 1).
 * **Custo Unitário**: Entry. Preenchido automaticamente com o custo unitário da última compra do livro. Se "Tipo de Entrada" for "Doação", fixa em 0.0. Recalcula o Custo Total.
 * **Custo Total**: Entry. Calculado automaticamente (Custo Unitário * Quantidade). Recalcula o Custo Unitário se alterado.
 * **Estado do livro**: Select list ("Novo" ou "Usado"). Default: "Novo".
 * **Botão Salvar**: Adiciona o item à tabela de livros.
 * **Botão Limpar**: Limpa os campos deste grupo.

---

## Grupo de Inserção Manual
*Tecla Enter em qualquer campo ativa o trigger de Salvar na tabela abaixo.*

### Seleção do Livro
 * **Pesquisa Inteligente**: Barra de busca por ISBN ou Descrição.
 * **Cadastrar Novo Livro**: Botão que abre modal de cadastro.
 * **Estoque Atual**: Label exibindo o saldo disponível.
 * **Pesquisar**: Botão que abre o "Modal de Pesquisa de Livros".
 * **Quantidade**: Entry (Default: 1).
 * **Custo Unitário**: Entry. Preenchido automaticamente com o custo unitário da última compra.
 * **Custo Total**: Entry. (Custo Unitário * Quantidade).
 * **Estado do livro**: Select list ("Novo" ou "Usado").
 * **Botão Salvar**: Adiciona o item à tabela.
 * **Botão Limpar**: Limpa os campos deste grupo.

---

### Tabela de Livros (Itens da Entrada)
*Com paginação, ordenação por cabeçalho e scroll horizontal/vertical.*

 * **Descrição**
 * **ID**
 * **Condição**
 * **Quantidade**
 * **Custo Unitário**
 * **Custo Total**
 * **Tipo**: Reflete o "Tipo de Entrada" (Compra/Doação).
 * **Editar (Ícone)**: Remove da tabela e carrega para o grupo de inserção manual.
 * **Deletar (Ícone)**: Remove o item da lista.

---

### Rodapé de Ações
 * **Botão Salvar**: Processa a transação (Cria registros em `entrada` e atualiza o `estoque` pelo algoritmo WACC).
 * **Botão Limpar**: Limpa toda a tela e reseta o cabeçalho.

---

### Componentes acessórios

## Modal de Pesquisa de Livros
### Filtros
 * ID, ISBN, Descrição, Classificação, Editora, Idioma, Edição, Volume, Coleção, Estado.
 * **Botão Limpar Filtros**

### Tabela de Resultados
 * **Carregar (Botão)**: Seleciona o livro e fecha o modal.
 * Descrição, ID, Classificação, Editora, Idioma, Edição, Volume, Coleção, ISBN10, ISBN13, **Estoque** (Saldo atual).

