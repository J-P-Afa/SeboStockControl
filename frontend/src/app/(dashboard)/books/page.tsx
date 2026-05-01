'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X, BookOpen, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { BooksTable } from '@/components/organisms/books-table';
import { BookFormDialog, type BookFormData } from '@/components/molecules/book-form-dialog';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from '@/hooks/use-books';
import { usePublishers } from '@/hooks/use-publishers';
import { useLanguages } from '@/hooks/use-languages';
import {
  importBookCover,
  removeBookCover,
  uploadBookCover,
} from '@/lib/api/books.api';
import {
  Condition,
  EditionType,
  Status,
  type Book,
  type CreateBookPayload,
  type UpdateBookPayload,
  type ListBooksFilters,
} from '@/types';

const DEFAULT_PAGE_SIZE = 10;

interface MultiSelectOption {
  label: string;
  value: string;
}

interface FilterMultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  emptyMessage?: string;
}

function FilterMultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  emptyMessage = 'Nenhuma opção encontrada.',
}: FilterMultiSelectProps) {
  const selectedLabel =
    selectedValues.length > 0 ? `${label} (${selectedValues.length})` : `Todas`;

  const toggleValue = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm" className="h-9 w-full justify-between font-normal">
              <span className="truncate">{selectedLabel}</span>
              <Filter className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-56 p-2">
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {options.map((option) => (
              <Label
                key={option.value}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => toggleValue(option.value)}
                />
                <span className="text-sm truncate">{option.label}</span>
              </Label>
            ))}
            {options.length === 0 && (
              <p className="text-sm text-muted-foreground px-2 py-1.5">{emptyMessage}</p>
            )}
          </div>
          {selectedValues.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-8 w-full"
              onClick={() => onChange([])}
            >
              Limpar {label.toLowerCase()}
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function BooksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [editionTypes, setEditionTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isActiveOnly, setIsActiveOnly] = useState(true);
  const [publisherIds, setPublisherIds] = useState<string[]>([]);
  const [languageIds, setLanguageIds] = useState<string[]>([]);

  const { data: publishers } = usePublishers(1, 100);
  const { data: languages } = useLanguages(1, 100);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const;

  const filters = useMemo<ListBooksFilters>(
    () => ({
      search: search || undefined,
      inStock: inStockOnly || undefined,
      conditions: conditions.length > 0 ? (conditions as Condition[]) : undefined,
      editionTypes: editionTypes.length > 0 ? (editionTypes as EditionType[]) : undefined,
      statuses: statuses.length > 0 ? (statuses as Status[]) : undefined,
      isActive: isActiveOnly,
      publisherIds: publisherIds.length > 0 ? publisherIds.map(Number) : undefined,
      languageIds: languageIds.length > 0 ? languageIds.map(Number) : undefined,
    }),
    [search, inStockOnly, conditions, editionTypes, statuses, isActiveOnly, publisherIds, languageIds],
  );

  const { data, isLoading } = useBooks(
    page,
    pageSize,
    sortBy,
    sorting.length > 0 ? sortOrder : undefined,
    filters,
  );

  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleSortingChange = useCallback<React.Dispatch<React.SetStateAction<SortingState>>>(
    (updaterOrValue) => {
      setSorting(updaterOrValue);
      setPage(1);
    },
    [],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleInStockChange = useCallback((checked: boolean) => {
    setInStockOnly(checked);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setInStockOnly(false);
    setConditions([]);
    setEditionTypes([]);
    setStatuses([]);
    setIsActiveOnly(true);
    setPublisherIds([]);
    setLanguageIds([]);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedBook(null);
    setFormOpen(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormOpen(true);
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setDeleteOpen(true);
  };

  async function handleFormSubmit(formData: BookFormData) {
    const commonPayload = {
      title: formData.title,
      isbn13: formData.isbn13,
      isbn10: formData.isbn10,
      listPrice: formData.listPrice,
      editionType: formData.editionType,
      volume: formData.volume,
      condition: formData.condition,
      status: formData.status,
      weight: formData.weight,
      publisherId: formData.publisherId ? Number(formData.publisherId) : undefined,
      languageId: formData.languageId ? Number(formData.languageId) : undefined,
      genreId: formData.genreId ? Number(formData.genreId) : undefined,
      publicationYear: formData.publicationYear,
      pages: formData.pages,
      synopsis: formData.synopsis,
      dimensions: formData.dimensions,
    };

    let savedBook: Book;
    if (selectedBook) {
      savedBook = await updateMutation.mutateAsync({ 
        id: selectedBook.id, 
        payload: commonPayload as UpdateBookPayload 
      });
    } else {
      savedBook = await createMutation.mutateAsync(commonPayload as CreateBookPayload);
    }

    try {
      if (formData.coverFile) {
        await uploadBookCover(savedBook.id, formData.coverFile);
      } else if (formData.externalCoverUrl) {
        await importBookCover(savedBook.id, formData.externalCoverUrl);
      } else if (formData.removeCover && savedBook.coverUrl) {
        await removeBookCover(savedBook.id);
      }
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    } catch {
      toast.error('Livro salvo, mas não foi possível salvar a capa');
    }

    setFormOpen(false);
    setSelectedBook(null);
  }

  async function handleDeleteConfirm() {
    if (selectedBook) {
      await deleteMutation.mutateAsync(selectedBook.id);
      setDeleteOpen(false);
      setSelectedBook(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Livros</h1>
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80 text-base">
            Gerencie o estoque de livros, preços e informações da coleção.
          </p>
        </div>

        <Button onClick={handleCreate} className="h-11 px-6 shadow-sm shadow-primary/5 hover:shadow-primary/10 transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Novo Livro
        </Button>
      </div>

      <div className="flex flex-col gap-3 relative z-20">
        <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-sm flex-wrap">
          <div className="flex gap-2 items-center shrink-0">
            <Label htmlFor="book-search" className="text-sm">Buscar</Label>
            <Input
              id="book-search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Título ou ISBN"
              className="min-w-[220px] border-border/80 focus-visible:ring-primary/20"
            />
          </div>
          <Label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-muted/40 hover:bg-muted/80 rounded-xl transition-colors border border-transparent">
            <Switch
              checked={inStockOnly}
              onCheckedChange={handleInStockChange}
            />
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

          <Button variant="secondary" size="sm" onClick={handleClearFilters} className="ml-auto">
            <X className="mr-1 h-4 w-4" />
            Limpar Todos
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40 animate-in slide-in-from-top-4 fade-in duration-200">
            <FilterMultiSelect
              label="Condição"
              selectedValues={conditions}
              onChange={(values) => { setConditions(values); setPage(1); }}
              options={[
                { value: Condition.NOVO, label: 'Novo' },
                { value: Condition.USADO, label: 'Usado' },
              ]}
            />

            <FilterMultiSelect
              label="Edição"
              selectedValues={editionTypes}
              onChange={(values) => { setEditionTypes(values); setPage(1); }}
              options={[
                { value: EditionType.NORMAL, label: 'Normal' },
                { value: EditionType.VARIANTE, label: 'Variante' },
              ]}
            />

            <FilterMultiSelect
              label="Status"
              selectedValues={statuses}
              onChange={(values) => { setStatuses(values); setPage(1); }}
              options={Object.values(Status).map((value) => ({ value, label: value }))}
            />

            <FilterMultiSelect
              label="Editora"
              selectedValues={publisherIds}
              onChange={(values) => { setPublisherIds(values); setPage(1); }}
              options={publishers?.items?.map((p) => ({ value: p.id.toString(), label: p.description })) ?? []}
              emptyMessage="Nenhuma editora encontrada."
            />

            <FilterMultiSelect
              label="Idioma"
              selectedValues={languageIds}
              onChange={(values) => { setLanguageIds(values); setPage(1); }}
              options={languages?.items?.map((l) => ({ value: l.id.toString(), label: l.description })) ?? []}
              emptyMessage="Nenhum idioma encontrado."
            />

            <div className="space-y-1 flex flex-col justify-end pb-1.5 ml-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={isActiveOnly} onCheckedChange={(checked) => { setIsActiveOnly(checked); setPage(1); }} />
                <span className="text-sm font-medium">Apenas ativos</span>
              </Label>
            </div>
          </div>
          )}
      </div>

      <BooksTable
        data={data?.items ?? []}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={selectedBook}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o livro "${selectedBook?.title}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
