'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  PackageMinus, 
  Trash2, 
  Edit2, 
  Plus, 
  Search,
  Barcode,
  Info,
  Save,
  Eraser,
  CreditCard,
  Store
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
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
import { DateField } from '@/components/molecules/date-field';
import { 
  bulkCreateSaida, 
  getBookStock, 
  createBook,
  getErrorMessage,
} from '@/lib/api';
import { useTiposSaida } from '@/hooks/use-tipos-saida';
import { useCanaisVenda } from '@/hooks/use-canais-venda';
import { useFormasPagamento } from '@/hooks/use-formas-pagamento';
import { formatCurrency } from '@/lib/formatters';
import { Condition, type Book, type CreateBookPayload } from '@/types';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';

interface SaidaItem {
  id: string; // Local ID for UI management
  bookId: number;
  title: string;
  isbn?: string;
  condition: Condition;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  tipoSaidaId: number;
  tipoSaidaDesc: string;
}

export default function RegistrarSaidaPage() {
  const { user } = useAuth();
  
  // Data Fetching
  const { data: tiposSaida = [] } = useTiposSaida();
  const { data: canaisVenda = [] } = useCanaisVenda();
  const { data: formasPagamento = [] } = useFormasPagamento();

  // Header State
  const [tipoSaidaId, setTipoSaidaId] = useState<number | null>(null);
  const [canalVendaId, setCanalVendaId] = useState<number | null>(null);
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | null>(null);
  const [dataSaida, setDataSaida] = useState(new Date().toISOString().split('T')[0]);
  const [observacaoGeral, setObservacaoGeral] = useState('');

  // Insertion State
  const [insertionMode, setInsertionMode] = useState<'reader' | 'manual'>('reader');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [condition, setCondition] = useState<Condition>(Condition.NOVO);
  const [readerIsbn, setReaderIsbn] = useState('');
  const [estoqueAtual, setEstoqueAtual] = useState<number | null>(null);

  // Table State
  const [items, setItems] = useState<SaidaItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dialog State
  const [bookFormOpen, setBookFormOpen] = useState(false);

  // Derived values
  const selectedTipoSaida = useMemo(() => 
    tiposSaida.find(t => t.id === tipoSaidaId), 
    [tiposSaida, tipoSaidaId]
  );

  const isVenda = selectedTipoSaida?.isVenda ?? false;
  const valorTotalItem = useMemo(() => quantidade * valorUnitario, [quantidade, valorUnitario]);
  const totalGeral = useMemo(() => items.reduce((acc, item) => acc + item.valorTotal, 0), [items]);

  // Set default TipoSaida once loaded
  useEffect(() => {
    if (tiposSaida.length > 0 && !tipoSaidaId) {
      const vendaTipo = tiposSaida.find(t => t.isVenda) || tiposSaida[0];
      requestAnimationFrame(() => {
        setTipoSaidaId(vendaTipo.id);
      });
    }
  }, [tiposSaida, tipoSaidaId]);

  // Adjust price if not venda
  useEffect(() => {
    if (!isVenda) {
      requestAnimationFrame(() => {
        setValorUnitario(0);
      });
    }
  }, [isVenda]);

  // Fetch book by ISBN for reader mode
  const handleIsbnSubmit = async (isbn: string) => {
    if (isbn.length < 10) return;
    
    try {
      const { data } = await apiClient.get(`/books/isbn/${isbn}`);
      if (data) {
        handleBookSelect(data);
      } else {
        toast.error('Livro não encontrado. Cadastre um novo.');
        setReaderIsbn(isbn);
        setBookFormOpen(true);
      }
    } catch {
      toast.error('Livro não encontrado. Cadastre um novo.');
      setReaderIsbn(isbn);
      setBookFormOpen(true);
    }
  };

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book);
    setCondition(book.condition);
    
    if (isVenda) {
      setValorUnitario(Number(book.listPrice) || 0);
    } else {
      setValorUnitario(0);
    }
    
    // Fetch stock
    try {
      const stock = await getBookStock(book.id);
      setEstoqueAtual(stock);
    } catch {
      console.error('Failed to fetch stock');
      setEstoqueAtual(0);
    }
  };

  const addItem = () => {
    if (!selectedBook) {
      toast.error('Selecione um livro primeiro');
      return;
    }

    if (!tipoSaidaId) {
      toast.error('Selecione um tipo de saída');
      return;
    }

    if (quantidade > (estoqueAtual ?? 0)) {
      toast.error(`Estoque insuficiente! Disponível: ${estoqueAtual}`);
      return;
    }

    const newItem: SaidaItem = {
      id: editingId || crypto.randomUUID(),
      bookId: selectedBook.id,
      title: selectedBook.title,
      isbn: selectedBook.isbn13 || selectedBook.isbn10 || undefined,
      condition,
      quantidade,
      valorUnitario,
      valorTotal: valorTotalItem,
      tipoSaidaId: tipoSaidaId,
      tipoSaidaDesc: selectedTipoSaida?.descricao || '',
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
    setValorUnitario(0);
    setEstoqueAtual(null);
    setReaderIsbn('');
    setEditingId(null);
  };

  const handleEdit = (item: SaidaItem) => {
    setEditingId(item.id);
    setSelectedBook({ id: item.bookId, title: item.title, condition: item.condition, listPrice: item.valorUnitario } as Book);
    setQuantidade(item.quantidade);
    setValorUnitario(item.valorUnitario);
    setCondition(item.condition);
    setTipoSaidaId(item.tipoSaidaId);
    setInsertionMode('manual');
    
    // Refresh stock
    getBookStock(item.bookId).then(setEstoqueAtual);
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

    if (isVenda && (!canalVendaId || !formaPagamentoId)) {
      toast.error('Canal de venda e forma de pagamento são obrigatórios para vendas');
      return;
    }

    try {
      await bulkCreateSaida({
        items: items.map(item => ({
          bookId: item.bookId,
          usuarioId: user.id,
          tipoSaidaId: item.tipoSaidaId,
          canalVendaId: isVenda ? canalVendaId || undefined : undefined,
          formaPagamentoId: isVenda ? formaPagamentoId || undefined : undefined,
          dataSaida: new Date(dataSaida).toISOString(),
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          observacao: observacaoGeral,
        }))
      });

      toast.success('Saída processada com sucesso!');
      resetForm();
    } catch {
      toast.error('Erro ao processar saída');
    }
  };

  const resetForm = () => {
    setItems([]);
    setObservacaoGeral('');
    clearInsertionGroup();
  };

  const handleNewBookSubmit = async (formData: BookFormData) => {
    try {
      const book = await createBook({
        ...formData,
        publisherId: formData.publisherId ? Number(formData.publisherId) : undefined,
        languageId: formData.languageId ? Number(formData.languageId) : undefined,
        genreId: formData.genreId ? Number(formData.genreId) : undefined,
      } as CreateBookPayload);
      
      setBookFormOpen(false);
      if (book) {
        handleBookSelect(book);
        toast.success('Livro cadastrado e selecionado');
      } else {
        toast.warning('Livro cadastrado mas não retornou dados. Tente pesquisar novamente.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar livro'));
    }
  };
  
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Registrar Saída</h1>
          <PackageMinus className="h-7 w-7 text-primary" />
        </div>
        <p className="text-muted-foreground/80">
          Gerencie a saída de itens do estoque (Vendas, Perdas, Doações, etc).
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
              <Label>Tipo de Saída</Label>
              <Select 
                value={tipoSaidaId?.toString() || ""} 
                onValueChange={(val) => setTipoSaidaId(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <span>
                    {tiposSaida.find(t => t.id === tipoSaidaId)?.descricao || "Selecione..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {tiposSaida.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isVenda && (
              <>
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="flex items-center gap-1">
                    <Store className="h-3 w-3" /> Canal de Venda
                  </Label>
                  <Select 
                    value={canalVendaId?.toString() || ""} 
                    onValueChange={(val) => setCanalVendaId(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <span>
                        {canaisVenda.find(c => c.id === canalVendaId)?.descricao || "Selecione..."}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {canaisVenda.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Forma de Pagamento
                  </Label>
                  <Select 
                    value={formaPagamentoId?.toString() || ""} 
                    onValueChange={(val) => setFormaPagamentoId(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <span>
                        {formasPagamento.find(f => f.id === formaPagamentoId)?.descricao || "Selecione..."}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>{f.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Data da Saída</Label>
              <DateField
                value={dataSaida}
                onChange={(e) => setDataSaida(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Observação Geral</Label>
            <Input 
              value={observacaoGeral} 
              onChange={(e) => setObservacaoGeral(e.target.value)}
              placeholder="Notas adicionais sobre esta transação..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-md ring-1 ring-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">Inserir Itens</CardTitle>
            <CardDescription>Adicione livros à lista de saída</CardDescription>
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
                  placeholder="ISBN10 ou ISBN13"
                  className="font-mono text-lg tracking-wider"
                />
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
              <div className={cn(
                "h-10 px-3 flex items-center justify-center rounded-md border text-sm font-bold",
                estoqueAtual !== null && estoqueAtual <= 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted/50"
              )}>
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
                max={estoqueAtual || 1}
                value={quantidade} 
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="text-center font-bold"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Preço Unitário</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input 
                  type="number" 
                  step="0.01" 
                  disabled={!isVenda}
                  value={valorUnitario} 
                  onChange={(e) => setValorUnitario(Number(e.target.value))}
                  className="pl-9 font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Valor Total Item</Label>
              <div className="h-10 px-3 flex items-center bg-primary/5 rounded-md border border-primary/20 text-sm font-extrabold text-primary">
                {formatCurrency(valorTotalItem)}
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
                disabled={!selectedBook || (estoqueAtual !== null && estoqueAtual <= 0)}
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
            <CardTitle className="text-lg uppercase tracking-tight font-black">Resumo da Saída</CardTitle>
            <CardDescription>{items.length} itens listados</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">VALOR TOTAL</p>
            <p className="text-2xl font-black text-primary">{formatCurrency(totalGeral)}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
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
                      <TableCell className="font-medium max-w-[300px] truncate">
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{item.isbn || 'SEM ISBN'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                          {item.tipoSaidaDesc}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.condition === Condition.NOVO ? 'success' : 'warning'} className="uppercase text-[10px]">
                          {item.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{item.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                      <TableCell className="text-right font-extrabold text-foreground">{formatCurrency(item.valorTotal)}</TableCell>
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
        book={readerIsbn ? { isbn13: readerIsbn.length === 13 ? readerIsbn : null, isbn10: readerIsbn.length === 10 ? readerIsbn : null } as Partial<Book> as Book : null}
      />
    </div>
  );
}
