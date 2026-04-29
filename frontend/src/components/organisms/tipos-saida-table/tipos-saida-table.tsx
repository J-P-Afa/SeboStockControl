import { useMemo } from 'react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import type { TipoSaida } from '@/types';
import { getTiposSaidaTableColumns } from './tipos-saida-table-columns';

interface TiposSaidaTableProps {
  data: TipoSaida[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (tipoSaida: TipoSaida) => void;
  onDelete: (tipoSaida: TipoSaida) => void;
  isLoading?: boolean;
}

export function TiposSaidaTable({
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
}: TiposSaidaTableProps) {
  const columns = useMemo(
    () => getTiposSaidaTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando tipos de saída..."
      emptyMessage="Nenhum tipo de saída encontrado."
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
