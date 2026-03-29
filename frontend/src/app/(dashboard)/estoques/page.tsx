'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Download, Filter, Search, Boxes } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules/select';
import { EstoquesTable } from '@/components/organisms/estoques-table';
import { EstoqueHistoryModal } from '@/components/organisms/estoque-history-modal';
import { BookFormDialog, type BookFormData } from '@/components/molecules/book-form-dialog';
import { useBooks, useUpdateBook } from '@/hooks/use-books';
import { usePublishers } from '@/hooks/use-publishers';
import { useLanguages } from '@/hooks/use-languages';
import { Condition, EditionType, Status, type Book, type ListBooksFilters } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export default function EstoquesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Basic Filters
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Advanced Filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [condition, setCondition] = useState<string>('Todos');
  const [editionType, setEditionType] = useState<string>('Todos');
  const [status, setStatus] = useState<string>('Todos');
  const [isActiveOnly, setIsActiveOnly] = useState(true);
  const [publisherId, setPublisherId] = useState<string>('Todos');
  const [languageId, setLanguageId] = useState<string>('Todos');

  const { data: publishers } = usePublishers(1, 100);
  const { data: languages } = useLanguages(1, 100);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const;

  const filters = useMemo<ListBooksFilters>(
    () => ({
      search: search || undefined,
      inStock: inStockOnly || undefined,
      condition: (condition !== 'Todos' ? condition : undefined) as Condition | undefined,
      editionType: (editionType !== 'Todos' ? editionType : undefined) as EditionType | undefined,
      status: (status !== 'Todos' ? status : undefined) as Status | undefined,
      isActive: isActiveOnly,
      publisherId: publisherId !== 'Todos' ? Number(publisherId) : undefined,
      languageId: languageId !== 'Todos' ? Number(languageId) : undefined,
    }),
    [search, inStockOnly, condition, editionType, status, isActiveOnly, publisherId, languageId],
  );

  const { data, isLoading } = useBooks(
    page,
    pageSize,
    sortBy,
    sorting.length > 0 ? sortOrder : undefined,
    filters,
  );

  const updateMutation = useUpdateBook();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleSortingChange = useCallback<React.Dispatch<React.SetStateAction<SortingState>>>(
    (updaterOrValue) => {
      setSorting(updaterOrValue);
      setPage(1);
    },
    [],
  );

  const handleEnterSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value;
      setSearch(val);
      setPage(1);
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormOpen(true);
  };

  const handleHistory = (book: Book) => {
    setSelectedBook(book);
    setHistoryOpen(true);
  };

  async function handleFormSubmit(formData: BookFormData) {
    if (selectedBook) {
      await updateMutation.mutateAsync({ 
        id: selectedBook.id, 
        payload: {
          title: formData.title,
          isbn13: formData.isbn13,
          isbn10: formData.isbn10,
          listPrice: formData.listPrice,
          editionType: formData.editionType,
          volume: formData.volume,
          condition: formData.condition,
          status: formData.status,
          weight: formData.weight,
          publisherId: Number(formData.publisherId),
          languageId: Number(formData.languageId),
          genreId: Number(formData.genreId),
          publicationYear: formData.publicationYear,
          pages: formData.pages,
          synopsis: formData.synopsis,
          dimensions: formData.dimensions,
        }
      });
    }
    setFormOpen(false);
    setSelectedBook(null);
  }

  const exportMainGridCsv = () => {
    if (!data?.items) return;
    const headers = ['ID', 'Descrição', 'ISBN', 'Condição', 'Estoque', 'Custo Uni', 'Custo Total'];
    const rows = data.items.map(b => [
      b.id,
      b.title,
      b.isbn13 || b.isbn10 || '',
      b.condition,
      b.stock ?? 0,
      b.listPrice ?? 0,
      (b.listPrice ?? 0) * (b.stock ?? 0)
    ]);
    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'consulta_estoques.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalTitles = data?.total ?? 0;
  const totalVolume = data?.items?.reduce((acc, curr) => acc + (curr.stock ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gestão de Estoque</h1>
            <Boxes className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80 text-base">
            Consulte inventários, históricos de balanço e valores patrimoniais.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-20">
        <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-sm flex-wrap">
          <div className="flex items-center relative gap-2 shrink-0">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
            <Input
              id="book-main-search"
              onKeyDown={handleEnterSearch}
              placeholder="ISBN, ID ou Descrição (Enter para buscar)"
              className="pl-9 min-w-[300px] border-border/80 focus-visible:ring-primary/20"
            />
          </div>

          <Label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-muted/40 hover:bg-muted/80 rounded-xl transition-colors border border-transparent">
            <Switch checked={inStockOnly} onCheckedChange={(c) => { setInStockOnly(c); setPage(1); }} />
            <span className="text-sm font-medium">Com estoque positivo</span>
          </Label>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-sm ${showAdvanced ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : ''}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros Avançados
          </Button>

          <Button variant="secondary" size="sm" onClick={() => {
            setSearch(''); setInStockOnly(false); setCondition('Todos'); setEditionType('Todos'); 
            setStatus('Todos'); setIsActiveOnly(true); setPublisherId('Todos'); setLanguageId('Todos');
            setPage(1);
          }} className="ml-auto">
            Limpar Todos
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40 animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Condição</Label>
              <Select value={condition} onValueChange={(v) => { if (v) { setCondition(v); setPage(1); } }}>
                <SelectTrigger className="h-9 mb-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value={Condition.NOVO}>Novo</SelectItem>
                  <SelectItem value={Condition.USADO}>Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Edição</Label>
              <Select value={editionType} onValueChange={(v) => { if (v) { setEditionType(v); setPage(1); } }}>
                <SelectTrigger className="h-9 mb-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value={EditionType.NORMAL}>Normal</SelectItem>
                  <SelectItem value={EditionType.VARIANTE}>Variante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Editora</Label>
              <Select value={publisherId} onValueChange={(v) => { setPublisherId(v || 'Todos'); setPage(1); }}>
                <SelectTrigger className="h-9 mb-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {publishers?.items?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.description}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Idioma</Label>
              <Select value={languageId} onValueChange={(v) => { setLanguageId(v || 'Todos'); setPage(1); }}>
                <SelectTrigger className="h-9 mb-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {languages?.items?.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.description}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 flex flex-col justify-end pb-1.5 ml-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={isActiveOnly} onCheckedChange={(c) => { setIsActiveOnly(c); setPage(1); }} />
                <span className="text-sm font-medium">Apenas ativos</span>
              </Label>
            </div>
          </div>
        )}
      </div>

      <EstoquesTable
        data={data?.items ?? []}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={handleEdit}
        onHistory={handleHistory}
        isLoading={isLoading}
      />

      {/* Footer Indicadores */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/40 pt-4 gap-4 mt-8">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Títulos Encontrados</span>
            <span className="text-2xl font-black text-foreground">{totalTitles}</span>
            <span className="text-[10px] text-muted-foreground">distintos na página atual</span>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Exemplares Físicos</span>
            <span className="text-2xl font-black text-primary">{totalVolume}</span>
            <span className="text-[10px] text-muted-foreground">somatório da página atual</span>
          </div>
        </div>
        
        <Button variant="outline" className="shadow-sm" onClick={exportMainGridCsv}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados (.csv)
        </Button>
      </div>

      <EstoqueHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        book={selectedBook}
      />

      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={selectedBook}
        onSubmit={handleFormSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
