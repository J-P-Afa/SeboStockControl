import type { ColumnDef } from '@tanstack/react-table';
import { History, Edit } from 'lucide-react';
import type { Book } from '@/types';
import { Condition } from '@/types';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { SortableHeader } from '@/components/molecules/data-table';
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
        <SortableHeader column={column}>Descrição</SortableHeader>
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
      header: ({ column }) => (
        <SortableHeader column={column}>Condição</SortableHeader>
      ),
      cell: ({ row }) => {
        const cond = row.original.condition;
        return (
          <Badge variant={cond === Condition.NOVO ? 'success' : 'warning'} className="uppercase text-[10px]">
            {cond}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <SortableHeader column={column}>Estoque</SortableHeader>
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
      header: ({ column }) => (
        <SortableHeader column={column}>Custo Unit.</SortableHeader>
      ),
      cell: ({ row }) => {
        const price = Number(row.original.stockUnitCost ?? 0);
        return <span className="font-mono text-sm">{formatCurrency(price)}</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'stockTotalCost',
      header: ({ column }) => (
        <SortableHeader column={column}>Custo Total</SortableHeader>
      ),
      cell: ({ row }) => {
        const totalCost = Number(row.original.stockTotalCost ?? 0);
        return <span className="font-mono text-sm font-semibold">{formatCurrency(totalCost)}</span>;
      },
      enableSorting: true,
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
