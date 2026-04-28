'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Plus, Store, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { CanalVendaFormDialog } from '@/components/molecules/canal-venda-form-dialog';
import { CanaisVendaTable } from '@/components/organisms/canais-venda-table';
import {
  useCanaisVenda,
  useCreateCanalVenda,
  useDeleteCanalVenda,
  useUpdateCanalVenda,
} from '@/hooks/use-canais-venda';
import type {
  CanalVenda,
  UpdateCanalVendaPayload,
} from '@/types';
import type { CanalVendaFormData } from '@/lib/validations/canal-venda.schema';

const DEFAULT_PAGE_SIZE = 10;

type SortableValue = string | number | boolean | null | undefined;

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR');
}

function compareValues(a: SortableValue, b: SortableValue) {
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  const aNumber = typeof a === 'string' ? Number(a) : a;
  const bNumber = typeof b === 'string' ? Number(b) : b;
  if (
    typeof aNumber === 'number' &&
    Number.isFinite(aNumber) &&
    typeof bNumber === 'number' &&
    Number.isFinite(bNumber)
  ) {
    return aNumber - bNumber;
  }

  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}

export default function CanaisVendaPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCanalVenda, setSelectedCanalVenda] =
    useState<CanalVenda | null>(null);

  const { data, isLoading } = useCanaisVenda(true);
  const createMutation = useCreateCanalVenda();
  const updateMutation = useUpdateCanalVenda();
  const deleteMutation = useDeleteCanalVenda();

  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return (data ?? []).filter((canalVenda) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeSearch(canalVenda.descricao).includes(normalizedSearch);

      return matchesSearch && canalVenda.isActive === isActiveFilter;
    });
  }, [data, search, isActiveFilter]);

  const sortedData = useMemo(() => {
    const [currentSort] = sorting;
    if (!currentSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const key = currentSort.id as keyof CanalVenda;
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
    setSelectedCanalVenda(null);
    setFormOpen(true);
  }

  function handleEdit(canalVenda: CanalVenda) {
    setSelectedCanalVenda(canalVenda);
    setFormOpen(true);
  }

  function handleDelete(canalVenda: CanalVenda) {
    setSelectedCanalVenda(canalVenda);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(formData: CanalVendaFormData) {
    if (selectedCanalVenda) {
      const payload: UpdateCanalVendaPayload = {
        descricao: formData.descricao,
        comissaoVariavel: formData.comissaoVariavel / 100,
        isActive: formData.isActive,
      };

      await updateMutation.mutateAsync({
        id: selectedCanalVenda.id,
        payload,
      });
      return;
    }

    await createMutation.mutateAsync({
      descricao: formData.descricao,
      comissaoVariavel: formData.comissaoVariavel / 100,
      isActive: formData.isActive,
    });
  }

  async function handleDeleteConfirm() {
    if (!selectedCanalVenda) return;

    await deleteMutation.mutateAsync(selectedCanalVenda.id);
    setDeleteOpen(false);
    setSelectedCanalVenda(null);
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Canais de Venda
            </h1>
            <Store className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Gerencie os canais usados para registrar saídas e vendas.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-5 w-5" />
          Novo Canal
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar canal..."
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

      <CanaisVendaTable
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

      <CanalVendaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        canalVenda={selectedCanalVenda}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o canal "${selectedCanalVenda?.descricao}"?`}
      />
    </div>
  );
}
