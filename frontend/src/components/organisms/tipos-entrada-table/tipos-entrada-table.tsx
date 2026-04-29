import { useMemo } from 'react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import type { TipoEntrada } from '@/types';
import { getTiposEntradaTableColumns } from './tipos-entrada-table-columns';

interface TiposEntradaTableProps {
  data: TipoEntrada[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (tipoEntrada: TipoEntrada) => void;
  onDelete: (tipoEntrada: TipoEntrada) => void;
  isLoading?: boolean;
}

export function TiposEntradaTable({
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
}: TiposEntradaTableProps) {
  const columns = useMemo(
    () => getTiposEntradaTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando tipos de entrada..."
      emptyMessage="Nenhum tipo de entrada encontrado."
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
