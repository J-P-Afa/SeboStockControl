'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/atoms/button';

interface SortableHeaderProps {
  /** Coluna do TanStack Table que controla o estado de ordenação. */
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => false | 'asc' | 'desc';
  };
  children: React.ReactNode;
}

/**
 * Cabeçalho de coluna clicável que alterna entre os estados: sem ordem, asc e desc.
 *
 * @ai-context Extraído de `users-table.tsx`. Reutilizável em qualquer `DataTable<T>`.
 */
export function SortableHeader({ column, children }: SortableHeaderProps) {
  const sorted = column.getIsSorted();
  const SortIcon =
    sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="-ml-4"
    >
      {children}
      <SortIcon className="ml-2 h-4 w-4" />
    </Button>
  );
}
