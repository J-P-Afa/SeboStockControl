import { useMemo } from 'react';
import {
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';

import { DataTable } from '@/components/molecules/data-table';
import { getLanguageTableColumns } from './language-table-columns';
import type { Language } from '@/types';

interface LanguageTableProps {
  data: Language[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (language: Language) => void;
  onDelete: (language: Language) => void;
  isLoading?: boolean;
}

export function LanguageTable({
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
}: LanguageTableProps) {
  const columns = useMemo(
    () => getLanguageTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando idiomas..."
      emptyMessage="Nenhum idioma encontrado."
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
