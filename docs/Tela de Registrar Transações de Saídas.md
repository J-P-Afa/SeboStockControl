# Tela de Registrar Transações de Saídas

## Cabeçalho da Transação (Campos comuns para todos os itens da sessão)
 * **Tipo de Saída**: Select list ("Venda", "Perda", "Avaria", "Doação", "Devolução Fornecedor"). Default: "Venda".
 * **Canal de Venda**: Select list (Obrigatório se Tipo de Saída for "Venda"). Ex: Mercado Livre, Shopee, Estante Virtual, etc.
 * **Forma de Pagamento**: Select list (Obrigatório se Tipo de Saída for "Venda"). Ex: Pix, Crédito, Débito, Dinheiro, etc.

---

## Grupo de inserção via leitor
*Tecla Enter em qualquer campo ativa o trigger de Salvar na tabela abaixo.*

 * **Inserir via leitor**: Entry para ISBN10 / ISBN13. Ao ler, altera o foco para o próximo campo. Caso o ISBN não esteja cadastrado, abre o modal de cadastro.
 * **Descrição do Livro**: Label preenchido automaticamente ao carregar o ISBN.
 * **Estoque Atual**: Label exibindo o saldo disponível. **Bloqueia inserção se quantidade > estoque.**
 * **Quantidade**: Entry (Default: 1).
 * **Preço Unitário**: Entry. Carrega o `preco_tabelado` do livro. Se "Tipo de Saída" não for "Venda", fixa em 0.0. Recalcula o Valor Total ao ser alterado.
 * **Valor Total**: Entry. Calculado automaticamente (Preço Unitário * Quantidade). Recalcula o Preço Unitário ao ser alterado.
 * **Estado do livro**: Select list ("Novo" ou "Usado"). Default conforme cadastro do livro.
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
 * **Quantidade**: Entry (Default: 1, valida contra estoque).
 * **Preço Unitário**: Entry (Carrega `preco_tabelado` se for venda).
 * **Valor Total**: Entry (Calculado).
 * **Estado do livro**: Select list ("Novo" ou "Usado").
 * **Botão Salvar**: Adiciona o item à tabela.
 * **Botão Limpar**: Limpa os campos deste grupo.

---

### Tabela de Livros (Itens da Saída)
*Com paginação, ordenação por cabeçalho e scroll horizontal/vertical.*

 * **Descrição**
 * **ID**
 * **Condição**
 * **Quantidade**
 * **Preço Unitário**
 * **Valor Total**
 * **Tipo**: Reflete o "Tipo de Saída" selecionado para o item.
 * **Editar (Ícone)**: Remove da tabela e carrega para o grupo de inserção manual.
 * **Deletar (Ícone)**: Remove o item da lista.

---

### Rodapé de Ações
 * **Botão Salvar**: Processa a transação (Cria registros em `saida` e abate do `estoque` de cada livro).
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

