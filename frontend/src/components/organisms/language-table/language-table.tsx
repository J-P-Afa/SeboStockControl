'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { getLanguageTableColumns } from './language-table-columns';
import type { Language } from '@/types';

interface LanguageTableProps {
  languages: Language[];
  onEdit: (language: Language) => void;
  onDelete: (language: Language) => void;
  isLoading?: boolean;
}

export function LanguageTable({
  languages,
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
      data={languages}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando idiomas..."
      emptyMessage="Nenhum idioma encontrado."
    />
  );
}
