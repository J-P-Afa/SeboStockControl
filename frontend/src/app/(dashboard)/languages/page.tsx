'use client';

import { useState, useCallback, useMemo } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Plus, Globe, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { Input } from '@/components/atoms/input';

import { LanguageTable } from '@/components/organisms/language-table';
import { LanguageFormDialog } from '@/components/molecules/language-form-dialog';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';

import {
  useLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from '@/hooks/use-languages';

import type { Language, ListLanguagesFilters } from '@/types';
import type { LanguageFormData } from '@/lib/validations/language.schema';

const DEFAULT_PAGE_SIZE = 10;

export default function LanguagesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const;

  const filters = useMemo<ListLanguagesFilters>(
    () => ({
      search: search || undefined,
      isActive: isActiveFilter,
    }),
    [search, isActiveFilter],
  );

  const hasNonDefaultFilters = search.length > 0 || !isActiveFilter;

  const { data, isLoading } = useLanguages(
    page,
    pageSize,
    sortBy,
    sorting.length > 0 ? sortOrder : undefined,
    filters,
  );

  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

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

  const handleIsActiveChange = useCallback((checked: boolean) => {
    setIsActiveFilter(checked);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setIsActiveFilter(true);
    setPage(1);
  }, []);

  function handleEdit(language: Language) {
    setSelectedLanguage(language);
    setFormOpen(true);
  }

  function handleDelete(language: Language) {
    setSelectedLanguage(language);
    setDeleteOpen(true);
  }

  function handleCreate() {
    setSelectedLanguage(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(formData: LanguageFormData) {
    if (selectedLanguage) {
      await updateMutation.mutateAsync({
        id: selectedLanguage.id,
        payload: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  }

  async function handleDeleteConfirm() {
    if (selectedLanguage) {
      await deleteMutation.mutateAsync(selectedLanguage.id);
      setDeleteOpen(false);
      setSelectedLanguage(null);
    }
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Idiomas
            </h1>
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Gerencie os idiomas disponíveis no sistema.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-5 w-5" />
          Novo Idioma
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar idioma..."
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

      <LanguageTable
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

      <LanguageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        language={selectedLanguage}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o idioma "${selectedLanguage?.description}"?`}
      />
    </div>
  );
}
