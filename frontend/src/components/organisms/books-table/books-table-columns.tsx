import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { SortableHeader } from '@/components/molecules/data-table';
import { formatCurrency } from '@/lib/formatters';
import type { Book } from '@/types';

interface GetBooksTableColumnsParams {
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

/**
 * Define as colunas da tabela de livros para uso com `DataTable<Book>`.
 * Separado do componente de renderização para seguir o princípio de responsabilidade única.
 */
export function getBooksTableColumns({
  onEdit,
  onDelete,
}: GetBooksTableColumnsParams): ColumnDef<Book>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortableHeader column={column}>Título</SortableHeader>
      ),
    },
    {
      accessorKey: 'author',
      header: ({ column }) => (
        <SortableHeader column={column}>Autor</SortableHeader>
      ),
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <SortableHeader column={column}>Estoque</SortableHeader>
      ),
      cell: ({ row }) => row.original.stock.toString(),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <SortableHeader column={column}>Preço</SortableHeader>
      ),
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: 'publisher',
      header: ({ column }) => (
        <SortableHeader column={column}>Editora</SortableHeader>
      ),
      cell: ({ row }) => row.original.publisher || '-',
    },
    {
      accessorKey: 'edition',
      header: ({ column }) => (
        <SortableHeader column={column}>Edição</SortableHeader>
      ),
      cell: ({ row }) => row.original.edition || '-',
    },
    {
      id: 'actions',
      header: () => 'Ações',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
