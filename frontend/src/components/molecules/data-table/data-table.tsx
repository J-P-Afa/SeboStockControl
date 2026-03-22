'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableEmpty } from './data-table-empty';
import { DataTablePagination, type PaginationConfig } from './data-table-pagination';

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** Exibe o skeleton de carregamento em vez da tabela quando verdadeiro. */
  isLoading?: boolean;
  /** Mensagem do spinner de carregamento. Padrão: "Carregando..." */
  loadingMessage?: string;
  /** Mensagem da linha de empty state. Padrão: "Nenhum registro encontrado." */
  emptyMessage?: string;
  /** Estado de ordenação controlado externamente (server-side sorting). */
  sorting?: SortingState;
  /** Callback acionado quando o usuário clica em um cabeçalho de coluna. */
  onSortingChange?: OnChangeFn<SortingState>;
  /**
   * Configuração de paginação. Se omitida, a barra de paginação não é renderizada.
   * @ai-context Suporta paginação server-side; `manualPagination` é sempre true.
   */
  pagination?: PaginationConfig;
}

/**
 * Componente genérico de tabela baseado em TanStack Table.
 * Encapsula loading state, empty state, sorting e paginação opcionais.
 *
 * @ai-context Single Source of Truth para todas as tabelas do projeto.
 * Use este componente como base para `RolesTable`, `UsersTable`, etc.
 * @side-effects Nenhum. Toda mutação de estado é delegada via callbacks.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  loadingMessage,
  emptyMessage,
  sorting,
  onSortingChange,
  pagination,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting: sorting ?? [] },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  if (isLoading) {
    return <DataTableSkeleton message={loadingMessage} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass noise-bg rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <DataTableEmpty colSpan={columns.length} message={emptyMessage} />
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && <DataTablePagination {...pagination} />}
    </div>
  );
}
