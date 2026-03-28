'use client';

import { useMemo } from 'react';
import {
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import { getGenresTableColumns } from './genre-table-columns';

import type { Genre } from '@/types';

interface GenresTableProps {
  data: Genre[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (genre: Genre) => void;
  onDelete: (genre: Genre) => void;
  isLoading?: boolean;
}

export function GenreTable({
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
}: GenresTableProps) {
  const columns = useMemo(
    () => getGenresTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Nenhum gênero encontrado."
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