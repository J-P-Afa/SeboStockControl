import { useMemo } from 'react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import type { FormaPagamento } from '@/types';
import { getFormasPagamentoTableColumns } from './formas-pagamento-table-columns';

interface FormasPagamentoTableProps {
  data: FormaPagamento[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (formaPagamento: FormaPagamento) => void;
  onDelete: (formaPagamento: FormaPagamento) => void;
  isLoading?: boolean;
}

export function FormasPagamentoTable({
  data,
  sorting,
  onSortingChange,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  isLoading,
}: FormasPagamentoTableProps) {
  const columns = useMemo(
    () => getFormasPagamentoTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando formas de pagamento..."
      emptyMessage="Nenhuma forma de pagamento encontrada."
      sorting={sorting}
      onSortingChange={onSortingChange}
      pagination={{
        page,
        pageSize,
        totalPages,
        total,
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
}
