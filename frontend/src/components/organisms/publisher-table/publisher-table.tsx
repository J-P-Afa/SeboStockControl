'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { getPublisherTableColumns } from './publisher-table-columns';
import type { Publisher } from '@/types';

interface PublisherTableProps {
  publishers: Publisher[];
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
  isLoading?: boolean;
}

export function PublisherTable({
  publishers,
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
      data={publishers}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando editoras..."
      emptyMessage="Nenhuma editora encontrada."
    />
  );
}
