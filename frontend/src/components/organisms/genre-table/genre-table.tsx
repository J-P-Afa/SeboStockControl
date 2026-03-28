'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { getGenresTableColumns } from './genre-table-columns';
import type { Genre } from '@/types';

interface GenreTableProps {
  genres: Genre[];
  onEdit: (genre: Genre) => void;
  onDelete: (genre: Genre) => void;
  isLoading?: boolean;
}

export function GenreTable({ genres, onEdit, onDelete, isLoading }: GenreTableProps) {
  const columns = useMemo(
    () => getGenresTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={genres}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando gêneros..."
      emptyMessage="Nenhum gênero encontrado."
    />
  );
}
