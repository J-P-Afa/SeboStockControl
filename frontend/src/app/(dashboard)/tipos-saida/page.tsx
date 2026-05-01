'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { ClipboardList, Plus, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { TipoSaidaFormDialog } from '@/components/molecules/tipo-saida-form-dialog';
import { TiposSaidaTable } from '@/components/organisms/tipos-saida-table';
import {
  useCreateTipoSaida,
  useDeleteTipoSaida,
  useTiposSaida,
  useUpdateTipoSaida,
} from '@/hooks/use-tipos-saida';
import type { TipoSaida } from '@/types';
import type { TipoSaidaFormData } from '@/lib/validations/tipo-saida.schema';

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

export default function TiposSaidaPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTipoSaida, setSelectedTipoSaida] =
    useState<TipoSaida | null>(null);

  const { data, isLoading } = useTiposSaida(true);
  const createMutation = useCreateTipoSaida();
  const updateMutation = useUpdateTipoSaida();
  const deleteMutation = useDeleteTipoSaida();

  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return (data ?? []).filter((tipoSaida) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeSearch(tipoSaida.descricao).includes(normalizedSearch);

      return matchesSearch && tipoSaida.isActive === isActiveFilter;
    });
  }, [data, search, isActiveFilter]);

  const sortedData = useMemo(() => {
    const [currentSort] = sorting;
    if (!currentSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const key = currentSort.id as keyof TipoSaida;
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
    setSelectedTipoSaida(null);
    setFormOpen(true);
  }

  function handleEdit(tipoSaida: TipoSaida) {
    setSelectedTipoSaida(tipoSaida);
    setFormOpen(true);
  }

  function handleDelete(tipoSaida: TipoSaida) {
    setSelectedTipoSaida(tipoSaida);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(formData: TipoSaidaFormData) {
    const payload = {
      descricao: formData.descricao,
      isVenda: formData.isVenda,
      isActive: formData.isActive,
    };

    if (selectedTipoSaida) {
      await updateMutation.mutateAsync({
        id: selectedTipoSaida.id,
        payload,
      });
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  async function handleDeleteConfirm() {
    if (!selectedTipoSaida) return;

    await deleteMutation.mutateAsync(selectedTipoSaida.id);
    setDeleteOpen(false);
    setSelectedTipoSaida(null);
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Tipos de Saída
            </h1>
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Gerencie os tipos usados para classificar vendas, perdas e outras
            saídas.
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

      <TiposSaidaTable
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

      <TipoSaidaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tipoSaida={selectedTipoSaida}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o tipo "${selectedTipoSaida?.descricao}"?`}
      />
    </div>
  );
}
