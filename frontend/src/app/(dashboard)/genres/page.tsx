'use client';

import { useState, useCallback, useMemo } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { Input } from '@/components/atoms/input';

import { GenreTable } from '@/components/organisms/genre-table';
import { GenreFormDialog } from '@/components/molecules/genre-form-dialog';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';

import {
  useGenres,
  useCreateGenre,
  useUpdateGenre,
  useDeleteGenre,
} from '@/hooks/use-genres';

import type { Genre, ListGenresFilters } from '@/types';
import type {
  CreateGenrePayload,
  UpdateGenrePayload,
} from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export default function GenresPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const;

  const filters = useMemo<ListGenresFilters>(
    () => ({
      search: search || undefined,
      isActive: isActiveFilter,
    }),
    [search, isActiveFilter],
  );

  const hasNonDefaultFilters =
    search.length > 0 || !isActiveFilter;

  const { data, isLoading } = useGenres(
    page,
    pageSize,
    sortBy,
    sorting.length > 0 ? sortOrder : undefined,
    filters,
  );

  const createMutation = useCreateGenre();
  const updateMutation = useUpdateGenre();
  const deleteMutation = useDeleteGenre();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  const handleSortingChange = useCallback<
    React.Dispatch<React.SetStateAction<SortingState>>
  >((updaterOrValue) => {
    setSorting(updaterOrValue);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleIsActiveChange = useCallback((checked: boolean) => {
    setIsActiveFilter(checked);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setIsActiveFilter(true);
    setPage(1);
  }, []);

  function handleEdit(genre: Genre) {
    setSelectedGenre(genre);
    setFormOpen(true);
  }

  function handleDelete(genre: Genre) {
    setSelectedGenre(genre);
    setDeleteOpen(true);
  }

  function handleCreate() {
    setSelectedGenre(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(
    formData: Record<string, unknown>,
  ) {
    if (selectedGenre) {
      const payload: UpdateGenrePayload = {};

      if (formData.description)
        payload.description = formData.description as string;

      if (formData.isActive !== undefined)
        payload.isActive = formData.isActive as boolean;

      await updateMutation.mutateAsync({
        id: selectedGenre.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync({
        description: formData.description as string,
      });
    }
  }

  async function handleDeleteConfirm() {
    if (selectedGenre) {
      await deleteMutation.mutateAsync(selectedGenre.id);
      setDeleteOpen(false);
      setSelectedGenre(null);
    }
  }

  console.log('DATA:', data);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Gêneros
          </h1>
          <p className="text-muted-foreground/80 text-base">
            Gerencie os gêneros dos livros.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-5 w-5" />
          Novo Gênero
        </Button>
      </div>

      {/* filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar gênero..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />

        <Label className="flex items-center gap-2 cursor-pointer">
          <Switch
            checked={isActiveFilter}
            onCheckedChange={handleIsActiveChange}
          />
          <span className="text-sm font-medium">Ativos</span>
        </Label>

        {hasNonDefaultFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <GenreTable
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

      <GenreFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        genre={selectedGenre}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o gênero "${selectedGenre?.description}"?`}
      />
    </div>
  );
}