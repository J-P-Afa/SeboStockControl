'use client';

import { useMemo } from 'react';
import {
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { DataTable } from '@/components/molecules/data-table';
import { getBooksTableColumns } from './books-table-columns';
import type { Book } from '@/types';

interface BooksTableProps {
  data: Book[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  isLoading?: boolean;
}

/**
 * Tabela de livros com sorting e paginação server-side.
 *
 * Sorting e paginação são controlados externamente pelo componente pai.
 * A definição de colunas foi extraída para `books-table-columns.tsx`.
 */
export function BooksTable({
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
}: BooksTableProps) {
  const columns = useMemo(
    () => getBooksTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Nenhum livro encontrado."
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
