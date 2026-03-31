'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Plus, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { BooksTable } from '@/components/organisms/books-table';
import { BookFormDialog, type BookFormData } from '@/components/molecules/book-form-dialog';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from '@/hooks/use-books';
import type { Book, CreateBookPayload, UpdateBookPayload, ListBooksFilters } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const;

  const filters = useMemo<ListBooksFilters>(
    () => ({
      search: search || undefined,
      inStock: inStockOnly || undefined,
    }),
    [search, inStockOnly],
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

    if (selectedBook) {
      await updateMutation.mutateAsync({ 
        id: selectedBook.id, 
        payload: commonPayload as UpdateBookPayload 
      });
    } else {
      await createMutation.mutateAsync(commonPayload as CreateBookPayload);
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

  const hasFilters = search.length > 0 || inStockOnly;

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

      <div className="flex flex-wrap items-center gap-4 p-1 relative z-20">
        <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
          <div className="flex gap-2 items-center">
            <Label htmlFor="book-search" className="text-sm">Buscar</Label>
            <Input
              id="book-search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Título ou ISBN"
              className="min-w-[220px]"
            />
          </div>
          <Label className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-background/50 rounded-lg transition-colors">
            <Switch
              checked={inStockOnly}
              onCheckedChange={handleInStockChange}
            />
            <span className="text-sm font-medium">Apenas em estoque</span>
          </Label>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setInStockOnly(false); setPage(1); }} className="text-muted-foreground hover:text-foreground">
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
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
