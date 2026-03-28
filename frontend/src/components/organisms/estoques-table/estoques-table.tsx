'use client';

import { useMemo } from 'react';
import type { SortingState, OnChangeFn } from '@tanstack/react-table';
import { DataTable } from '@/components/molecules/data-table';
import { getEstoquesTableColumns } from './estoques-table-columns';
import type { Book } from '@/types';

interface EstoquesTableProps {
  data: Book[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onHistory: (book: Book) => void;
  onEdit: (book: Book) => void;
  isLoading?: boolean;
}

export function EstoquesTable({
  data,
  sorting,
  onSortingChange,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
  onHistory,
  onEdit,
  isLoading,
}: EstoquesTableProps) {
  const columns = useMemo(
    () => getEstoquesTableColumns({ onHistory, onEdit }),
    [onHistory, onEdit],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Nenhum item encontrado no estoque."
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
