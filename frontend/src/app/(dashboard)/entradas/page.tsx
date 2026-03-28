'use client';

import { useState, useMemo } from 'react';
import { 
  PackagePlus, 
  Trash2, 
  Edit2, 
  Plus, 
  Calendar as CalendarIcon,
  Search,
  Barcode,
  Info,
  Save,
  Eraser,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/atoms/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/molecules/select';
import { BookSearchAutocomplete } from '@/components/molecules/book-search-autocomplete';
import { BookFormDialog, type BookFormData } from '@/components/molecules/book-form-dialog';
import { bulkCreateEntrada, getLastCost, getBookStock, createBook } from '@/lib/api';
import { lookupExternalBook } from '@/lib/api/books.api';
import { formatCurrency } from '@/lib/formatters';
import { Condition, type Book, type ExternalBook, type CreateBookPayload } from '@/types';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';

enum TipoEntrada {
  COMPRA = 'Compra',
  DOACAO = 'Doação Recebida',
}

interface EntradaItem {
  id: string; // Local ID for UI management
  bookId: number;
  title: string;
  isbn?: string;
  condition: Condition;
  quantidade: number;
  custoUnitario: number;
  custoTotal: number;
}

export default function EntradasPage() {
  const { user } = useAuth();
  
  // Header State
  const [tipoEntrada, setTipoEntrada] = useState<TipoEntrada>(TipoEntrada.COMPRA);
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedor, setFornecedor] = useState('');
  const [numeroNotaFiscal, setNumeroNotaFiscal] = useState('');
  const [observacaoGeral, setObservacaoGeral] = useState('');

  // Insertion State
  const [insertionMode, setInsertionMode] = useState<'reader' | 'manual'>('reader');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [custoUnitario, setCustoUnitario] = useState(0);
  const [condition, setCondition] = useState<Condition>(Condition.NOVO);
  const [readerIsbn, setReaderIsbn] = useState('');
  const [estoqueAtual, setEstoqueAtual] = useState<number | null>(null);

  // Table State
  const [items, setItems] = useState<EntradaItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dialog State
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [externalBookData, setExternalBookData] = useState<ExternalBook | null>(null);
  const [isFetchingExternal, setIsFetchingExternal] = useState(false);

  // Calculated values
  const custoTotalItem = useMemo(() => quantidade * custoUnitario, [quantidade, custoUnitario]);
  const totalGeral = useMemo(() => items.reduce((acc, item) => acc + item.custoTotal, 0), [items]);

  // Fetch book by ISBN for reader mode
  const handleIsbnSubmit = async (isbn: string) => {
    if (isbn.length < 10) return;
    
    try {
      const { data } = await apiClient.get(`/books/isbn/${isbn}`);
      if (data.success && data.data) {
        handleBookSelect(data.data);
      } else {
        // Not found in local DB, try external
        await handleExternalLookup(isbn);
      }
    } catch {
      // 404 or other error, try external
      await handleExternalLookup(isbn);
    }
  };

  const handleExternalLookup = async (isbn: string) => {
    setIsFetchingExternal(true);
    toast.info('Livro não encontrado localmente. Buscando na Open Library...');
    
    try {
      const data = await lookupExternalBook(isbn);
      if (data) {
        setExternalBookData(data);
        toast.success('Dados encontrados na Open Library!');
      } else {
        setExternalBookData(null);
        toast.warning('Livro não encontrado na Open Library. Preencha manualmente.');
      }
    } catch {
      setExternalBookData(null);
      toast.error('Erro ao consultar Open Library. Preencha manualmente.');
    } finally {
      setIsFetchingExternal(false);
      setReaderIsbn(isbn);
      setBookFormOpen(true);
    }
  };

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book);
    setCondition(book.condition);
    
    // Fetch stock and last cost
    try {
      const [stock, cost] = await Promise.all([
        getBookStock(book.id),
        getLastCost(book.id)
      ]);
      setEstoqueAtual(stock);
      
      if (tipoEntrada === TipoEntrada.DOACAO) {
        setCustoUnitario(0);
      } else {
        setCustoUnitario(cost || 0);
      }
    } catch {
      console.error('Failed to fetch book details');
    }
  };

  const addItem = () => {
    if (!selectedBook) {
      toast.error('Selecione um livro primeiro');
      return;
    }

    const newItem: EntradaItem = {
      id: editingId || crypto.randomUUID(),
      bookId: selectedBook.id,
      title: selectedBook.title,
      isbn: selectedBook.isbn13 || selectedBook.isbn10 || undefined,
      condition,
      quantidade,
      custoUnitario,
      custoTotal: custoTotalItem,
    };

    if (editingId) {
      setItems(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
      toast.success('Item atualizado');
    } else {
      setItems(prev => [...prev, newItem]);
      toast.success('Item adicionado');
    }

    clearInsertionGroup();
  };

  const clearInsertionGroup = () => {
    setSelectedBook(null);
    setQuantidade(1);
    setCustoUnitario(0);
    setEstoqueAtual(null);
    setReaderIsbn('');
    setEditingId(null);
    setExternalBookData(null);
  };

  const handleEdit = (item: EntradaItem) => {
    setEditingId(item.id);
    setSelectedBook({ id: item.bookId, title: item.title, condition: item.condition } as Book);
    setQuantidade(item.quantidade);
    setCustoUnitario(item.custoUnitario);
    setCondition(item.condition);
    setInsertionMode('manual');
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveAll = async () => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      await bulkCreateEntrada({
        usuarioId: user.id,
        dataEntrada: new Date(dataEntrada).toISOString(),
        fornecedor,
        numeroNotaFiscal,
        observacao: observacaoGeral,
        items: items.map(item => ({
          bookId: item.bookId,
          quantidade: item.quantidade,
          custoUnitario: item.custoUnitario,
          fornecedor,
          numeroNotaFiscal,
          observacao: observacaoGeral,
        }))
      });

      toast.success('Entrada processada com sucesso!');
      resetForm();
    } catch {
      toast.error('Erro ao processar entrada');
    }
  };

  const resetForm = () => {
    setItems([]);
    setFornecedor('');
    setNumeroNotaFiscal('');
    setObservacaoGeral('');
    clearInsertionGroup();
  };

  const handleNewBookSubmit = async (formData: BookFormData) => {
    try {
      const book = await createBook({
        ...formData,
        publisherId: Number(formData.publisherId),
        languageId: Number(formData.languageId),
        genreId: Number(formData.genreId),
      } as CreateBookPayload);
      
      setBookFormOpen(false);
      handleBookSelect(book);
      toast.success('Livro cadastrado e selecionado');
    } catch {
      toast.error('Erro ao cadastrar livro');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Registrar Entrada</h1>
          <PackagePlus className="h-7 w-7 text-primary" />
        </div>
        <p className="text-muted-foreground/80">
          Gerencie a entrada de novos itens no estoque (Compras ou Doações).
        </p>
      </div>

      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Cabeçalho da Transação</CardTitle>
          </div>
          <CardDescription>Informações comuns a todos os itens desta sessão</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Tipo de Entrada</Label>
              <Select 
                value={tipoEntrada} 
                onValueChange={(val) => {
                  setTipoEntrada(val as TipoEntrada);
                  if (val === TipoEntrada.DOACAO) setCustoUnitario(0);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoEntrada.COMPRA}>{TipoEntrada.COMPRA}</SelectItem>
                  <SelectItem value={TipoEntrada.DOACAO}>{TipoEntrada.DOACAO}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={dataEntrada} 
                  onChange={(e) => setDataEntrada(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fornecedor / Doador</Label>
              <Input 
                value={fornecedor} 
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: Amazon, João da Silva"
              />
            </div>

            <div className="space-y-2">
              <Label>Nota Fiscal</Label>
              <Input 
                value={numeroNotaFiscal} 
                onChange={(e) => setNumeroNotaFiscal(e.target.value)}
                placeholder="Número da NF (opcional)"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Observação Geral</Label>
            <Input 
              value={observacaoGeral} 
              onChange={(e) => setObservacaoGeral(e.target.value)}
              placeholder="Notas adicionais sobre esta entrada..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-md ring-1 ring-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">Inserir Itens</CardTitle>
            <CardDescription>Adicione livros à lista de recebimento</CardDescription>
          </div>
          <div className="flex bg-muted p-1 rounded-lg">
            <Button 
              variant={insertionMode === 'reader' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => { setInsertionMode('reader'); clearInsertionGroup(); }}
              className="h-8"
            >
              <Barcode className="mr-2 h-4 w-4" />
              Leitor
            </Button>
            <Button 
              variant={insertionMode === 'manual' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => { setInsertionMode('manual'); clearInsertionGroup(); }}
              className="h-8"
            >
              <Search className="mr-2 h-4 w-4" />
              Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {insertionMode === 'reader' ? (
              <div className="md:col-span-4 space-y-2">
                <Label>Inserir via Leitor (ISBN)</Label>
                <div className="relative">
                  <Input 
                    value={readerIsbn}
                    onChange={(e) => setReaderIsbn(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleIsbnSubmit(readerIsbn);
                      }
                    }}
                    autoFocus
                    disabled={isFetchingExternal}
                    placeholder="ISBN10 ou ISBN13"
                    className="font-mono text-lg tracking-wider pr-10"
                  />
                  {isFetchingExternal && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="md:col-span-4 space-y-2">
                <Label>Pesquisa Inteligente</Label>
                <BookSearchAutocomplete 
                  value={selectedBook?.title || ''}
                  onSelect={handleBookSelect}
                  onClear={clearInsertionGroup}
                  onAddNew={() => setBookFormOpen(true)}
                />
              </div>
            )}

            <div className="md:col-span-4 space-y-2">
              <Label>Livro Selecionado</Label>
              <div className="h-10 px-3 flex items-center bg-muted/50 rounded-md border border-dashed text-sm truncate font-medium">
                {selectedBook ? selectedBook.title : 'Nenhum selecionado'}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Estoque Atual</Label>
              <div className="h-10 px-3 flex items-center justify-center bg-muted/50 rounded-md border text-sm font-bold">
                {estoqueAtual !== null ? estoqueAtual : '-'}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2 text-right">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-full h-10 border-primary/20 hover:bg-primary/5"
                onClick={() => setBookFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Quantidade</Label>
              <Input 
                type="number" 
                min={1} 
                value={quantidade} 
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="text-center font-bold"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Custo Unitário</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input 
                  type="number" 
                  step="0.01" 
                  disabled={tipoEntrada === TipoEntrada.DOACAO}
                  value={custoUnitario} 
                  onChange={(e) => setCustoUnitario(Number(e.target.value))}
                  className="pl-9 font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Custo Total Item</Label>
              <div className="h-10 px-3 flex items-center bg-primary/5 rounded-md border border-primary/20 text-sm font-extrabold text-primary">
                {formatCurrency(custoTotalItem)}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Estado</Label>
              <Select value={condition} onValueChange={(val) => setCondition(val as Condition)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Condition.NOVO}>Novo</SelectItem>
                  <SelectItem value={Condition.USADO}>Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearInsertionGroup} 
                className="flex-1"
                aria-label="Limpar campos"
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button 
                onClick={addItem} 
                className="flex-1 shadow-lg shadow-primary/20"
                disabled={!selectedBook}
              >
                <Plus className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg uppercase tracking-tight font-black">Resumo da Entrada</CardTitle>
            <CardDescription>{items.length} itens listados</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">TOTAL GERAL</p>
            <p className="text-2xl font-black text-primary">{formatCurrency(totalGeral)}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">ISBN</TableHead>
                  <TableHead className="text-center">Condição</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Unitário</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                      Nenhum item adicionado à lista.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium max-w-[300px] truncate">{item.title}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">{item.isbn || '-'}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                          item.condition === Condition.NOVO ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {item.condition}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">{item.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.custoUnitario)}</TableCell>
                      <TableCell className="text-right font-extrabold text-foreground">{formatCurrency(item.custoTotal)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-primary hover:bg-primary/10">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" size="lg" onClick={resetForm} disabled={items.length === 0} className="px-8">
          <Eraser className="mr-2 h-5 w-5" />
          Limpar Tudo
        </Button>
        <Button size="lg" onClick={handleSaveAll} disabled={items.length === 0} className="px-12 shadow-xl shadow-primary/20">
          <Save className="mr-2 h-5 w-5" />
          Finalizar Transação
        </Button>
      </div>

      <BookFormDialog 
        open={bookFormOpen}
        onOpenChange={setBookFormOpen}
        onSubmit={handleNewBookSubmit}
        externalBook={externalBookData}
        book={readerIsbn && !externalBookData ? { isbn13: readerIsbn.length === 13 ? readerIsbn : null, isbn10: readerIsbn.length === 10 ? readerIsbn : null } as Partial<Book> as Book : null}
      />
    </div>
  );
}
