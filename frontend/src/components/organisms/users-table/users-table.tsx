'use client';

import { useMemo } from 'react';
import {
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { DataTable } from '@/components/molecules/data-table';
import { getUsersTableColumns } from './users-table-columns';
import type { User } from '@/types';

interface UsersTableProps {
  data: User[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
}

/**
 * Tabela de usuários com sorting e paginação server-side.
 *
 * @ai-context Refatorado para consumir `DataTable<User>` genérico.
 * Sorting e paginação são controlados externamente pelo componente pai.
 * A definição de colunas foi extraída para `users-table-columns.tsx`.
 */
export function UsersTable({
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
}: UsersTableProps) {
  const columns = useMemo(
    () => getUsersTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Nenhum usuário encontrado."
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
