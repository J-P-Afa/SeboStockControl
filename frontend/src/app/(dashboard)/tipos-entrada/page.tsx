'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { ClipboardPlus, Plus, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { TipoEntradaFormDialog } from '@/components/molecules/tipo-entrada-form-dialog';
import { TiposEntradaTable } from '@/components/organisms/tipos-entrada-table';
import {
  useCreateTipoEntrada,
  useDeleteTipoEntrada,
  useTiposEntrada,
  useUpdateTipoEntrada,
} from '@/hooks/use-tipos-entrada';
import type { TipoEntrada } from '@/types';
import type { TipoEntradaFormData } from '@/lib/validations/tipo-entrada.schema';

const DEFAULT_PAGE_SIZE = 10;

type SortableValue = string | number | boolean | null | undefined;

export function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR');
}

export function compareValues(a: SortableValue, b: SortableValue) {
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}

export default function TiposEntradaPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTipoEntrada, setSelectedTipoEntrada] =
    useState<TipoEntrada | null>(null);

  const { data, isLoading } = useTiposEntrada(true);
  const createMutation = useCreateTipoEntrada();
  const updateMutation = useUpdateTipoEntrada();
  const deleteMutation = useDeleteTipoEntrada();

  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return (data ?? []).filter((tipoEntrada) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeSearch(tipoEntrada.descricao).includes(normalizedSearch);

      return matchesSearch && tipoEntrada.isActive === isActiveFilter;
    });
  }, [data, search, isActiveFilter]);

  const sortedData = useMemo(() => {
    const [currentSort] = sorting;
    if (!currentSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const key = currentSort.id as keyof TipoEntrada;
      const result = compareValues(
        a[key] as SortableValue,
        b[key] as SortableValue,
      );

      return currentSort.desc ? -result : result;
    });
  }, [filteredData, sorting]);

  const total = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const hasNonDefaultFilters = search.length > 0 || !isActiveFilter;

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

  function handleCreate() {
    setSelectedTipoEntrada(null);
    setFormOpen(true);
  }

  function handleEdit(tipoEntrada: TipoEntrada) {
    setSelectedTipoEntrada(tipoEntrada);
    setFormOpen(true);
  }

  function handleDelete(tipoEntrada: TipoEntrada) {
    setSelectedTipoEntrada(tipoEntrada);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(formData: TipoEntradaFormData) {
    const payload = {
      descricao: formData.descricao,
      isDoacao: formData.isDoacao,
      isActive: formData.isActive,
    };

    if (selectedTipoEntrada) {
      await updateMutation.mutateAsync({
        id: selectedTipoEntrada.id,
        payload,
      });
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  async function handleDeleteConfirm() {
    if (!selectedTipoEntrada) return;

    await deleteMutation.mutateAsync(selectedTipoEntrada.id);
    setDeleteOpen(false);
    setSelectedTipoEntrada(null);
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Tipos de Entrada
            </h1>
            <ClipboardPlus className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Gerencie os tipos usados para classificar compras, doações e outras
            entradas.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-5 w-5" />
          Novo Tipo
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar tipo..."
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
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

      <TiposEntradaTable
        data={pageData}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <TipoEntradaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tipoEntrada={selectedTipoEntrada}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o tipo "${selectedTipoEntrada?.descricao}"?`}
      />
    </div>
  );
}
