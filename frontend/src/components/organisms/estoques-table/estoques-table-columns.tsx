import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, History, Edit } from 'lucide-react';
import type { Book } from '@/types';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { formatCurrency } from '@/lib/formatters';

interface GetColumnsParams {
  onHistory: (book: Book) => void;
  onEdit: (book: Book) => void;
}

export function getEstoquesTableColumns({
  onHistory,
  onEdit,
}: GetColumnsParams): ColumnDef<Book>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('id')}</span>,
      enableSorting: true,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent px-0 font-semibold"
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.original.title}</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'isbn13',
      header: 'ISBN',
      cell: ({ row }) => (
        <span className="font-mono text-sm tracking-tight text-muted-foreground">
          {row.original.isbn13 || row.original.isbn10 || '-'}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'condition',
      header: 'Condição',
      cell: ({ row }) => {
        const cond = String(row.getValue('condition'));
        return (
          <Badge variant={cond === 'NOVO' ? 'default' : 'secondary'} className="uppercase text-[10px]">
            {cond}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent px-0 font-semibold"
        >
          Estoque
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const stock = row.original.stock ?? 0;
        return (
          <Badge variant={stock > 0 ? 'default' : 'destructive'} className="font-mono">
            {stock}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'stockUnitCost',
      header: 'Custo Unit.',
      cell: ({ row }) => {
        const price = Number(row.original.stockUnitCost ?? 0);
        return <span className="font-mono text-sm">{formatCurrency(price)}</span>;
      },
      enableSorting: true,
    },
    {
      id: 'totalPrice',
      header: 'Custo Total',
      cell: ({ row }) => {
        const totalCost = Number(row.original.stockTotalCost ?? 0);
        return <span className="font-mono text-sm font-semibold">{formatCurrency(totalCost)}</span>;
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onHistory(row.original)}
            className="text-primary hover:text-primary hover:bg-primary/10"
            title="Extrato de Movimentações"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="text-muted-foreground hover:text-foreground"
            title="Editar informações base"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}
