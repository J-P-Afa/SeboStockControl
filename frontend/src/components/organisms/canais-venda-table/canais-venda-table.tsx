import { useMemo } from 'react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import type { CanalVenda } from '@/types';
import { getCanaisVendaTableColumns } from './canais-venda-table-columns';

interface CanaisVendaTableProps {
  data: CanalVenda[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (canalVenda: CanalVenda) => void;
  onDelete: (canalVenda: CanalVenda) => void;
  isLoading?: boolean;
}

export function CanaisVendaTable({
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
}: CanaisVendaTableProps) {
  const columns = useMemo(
    () => getCanaisVendaTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando canais de venda..."
      emptyMessage="Nenhum canal de venda encontrado."
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
