import type { ColumnDef } from '@tanstack/react-table';
import { ImageIcon, Pencil, Trash2 } from 'lucide-react';
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
import { resolveBookCoverUrl } from '@/lib/api/books.api';
import type { Book } from '@/types';
import { Badge } from '@/components/atoms/badge';

interface GetBooksTableColumnsParams {
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

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
      cell: ({ row }) => {
        const coverUrl = resolveBookCoverUrl(row.original.coverUrl);

        return (
        <div className="flex items-center gap-3">
          <div className="h-12 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
          </div>
          <span className="font-medium">{row.original.title}</span>
        </div>
        );
      }
    },
    {
      accessorKey: 'volume',
      header: ({ column }) => (
        <SortableHeader column={column}>Volume</SortableHeader>
      ),
      cell: ({ row }) => row.original.volume || '-',
    },
    {
      accessorKey: 'isbn13',
      header: ({ column }) => (
        <SortableHeader column={column}>ISBN-13</SortableHeader>
      ),
      cell: ({ row }) => row.original.isbn13 || '-',
    },
    {
      accessorKey: 'condition',
      header: ({ column }) => (
        <SortableHeader column={column}>Estado</SortableHeader>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.condition === 'novo' ? 'default' : 'outline'}>
          {row.original.condition === 'novo' ? 'Novo' : 'Usado'}
        </Badge>
      ),
    },
    {
      accessorKey: 'listPrice',
      header: ({ column }) => (
        <SortableHeader column={column}>Preço Base</SortableHeader>
      ),
      cell: ({ row }) => row.original.listPrice ? formatCurrency(Number(row.original.listPrice)) : '-',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="text-xs capitalize">
          {row.original.status.replace('_', ' ')}
        </span>
      ),
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
