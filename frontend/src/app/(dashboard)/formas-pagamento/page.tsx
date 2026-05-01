'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { CreditCard, Plus, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { FormaPagamentoFormDialog } from '@/components/molecules/forma-pagamento-form-dialog';
import { FormasPagamentoTable } from '@/components/organisms/formas-pagamento-table';
import { SalesComparisonDashboard } from '@/components/organisms/dashboard/sales-comparison-dashboard';
import {
  useCreateFormaPagamento,
  useDeleteFormaPagamento,
  useFormasPagamento,
  useUpdateFormaPagamento,
} from '@/hooks/use-formas-pagamento';
import type { FormaPagamento } from '@/types';
import type { FormaPagamentoFormData } from '@/lib/validations/forma-pagamento.schema';

const DEFAULT_PAGE_SIZE = 10;

type SortableValue = string | number | boolean | null | undefined;

export function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR');
}

export function toNumber(value: SortableValue) {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return typeof numericValue === 'number' && Number.isFinite(numericValue)
    ? numericValue
    : null;
}

export function compareValues(a: SortableValue, b: SortableValue) {
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  const aNumber = toNumber(a);
  const bNumber = toNumber(b);
  if (aNumber !== null && bNumber !== null) {
    return aNumber - bNumber;
  }

  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}

export default function FormasPagamentoPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFormaPagamento, setSelectedFormaPagamento] =
    useState<FormaPagamento | null>(null);

  const { data, isLoading } = useFormasPagamento(true);
  const createMutation = useCreateFormaPagamento();
  const updateMutation = useUpdateFormaPagamento();
  const deleteMutation = useDeleteFormaPagamento();

  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return (data ?? []).filter((formaPagamento) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeSearch(formaPagamento.descricao).includes(normalizedSearch);

      return matchesSearch && formaPagamento.isActive === isActiveFilter;
    });
  }, [data, search, isActiveFilter]);

  const sortedData = useMemo(() => {
    const [currentSort] = sorting;
    if (!currentSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const key = currentSort.id as keyof FormaPagamento;
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
    setSelectedFormaPagamento(null);
    setFormOpen(true);
  }

  function handleEdit(formaPagamento: FormaPagamento) {
    setSelectedFormaPagamento(formaPagamento);
    setFormOpen(true);
  }

  function handleDelete(formaPagamento: FormaPagamento) {
    setSelectedFormaPagamento(formaPagamento);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(formData: FormaPagamentoFormData) {
    const payload = {
      descricao: formData.descricao,
      taxa: formData.taxa / 100,
      isActive: formData.isActive,
    };

    if (selectedFormaPagamento) {
      await updateMutation.mutateAsync({
        id: selectedFormaPagamento.id,
        payload,
      });
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  async function handleDeleteConfirm() {
    if (!selectedFormaPagamento) return;

    await deleteMutation.mutateAsync(selectedFormaPagamento.id);
    setDeleteOpen(false);
    setSelectedFormaPagamento(null);
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Formas de Pagamento
            </h1>
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Gerencie as formas de pagamento disponíveis nas vendas.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-5 w-5" />
          Nova Forma
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar forma..."
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

      <FormasPagamentoTable
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

      <SalesComparisonDashboard
        title="Comparativo de vendas por forma de pagamento"
        description="Compare faturamento, lucro e margem líquida das formas de pagamento no período selecionado."
        dimension="formaPagamento"
        options={(data ?? []).map((formaPagamento) => ({
          id: formaPagamento.id,
          label: formaPagamento.descricao,
          isActive: formaPagamento.isActive,
        }))}
        isLoadingOptions={isLoading}
      />

      <FormaPagamentoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        formaPagamento={selectedFormaPagamento}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir a forma "${selectedFormaPagamento?.descricao}"?`}
      />
    </div>
  );
}
