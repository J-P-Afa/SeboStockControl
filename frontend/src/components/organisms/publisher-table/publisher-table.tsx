import { useMemo } from 'react';
import {
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import { getPublisherTableColumns } from './publisher-table-columns';
import type { Publisher } from '@/types';

interface PublisherTableProps {
  data: Publisher[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
  isLoading?: boolean;
}

export function PublisherTable({
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
}: PublisherTableProps) {
  const columns = useMemo(
    () => getPublisherTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando editoras..."
      emptyMessage="Nenhuma editora encontrada."
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
