import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { SortableHeader } from '@/components/molecules/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { formatDate } from '@/lib/formatters';
import type { TipoSaida } from '@/types';

interface GetTiposSaidaTableColumnsParams {
  onEdit: (tipoSaida: TipoSaida) => void;
  onDelete: (tipoSaida: TipoSaida) => void;
}

export function getTiposSaidaTableColumns({
  onEdit,
  onDelete,
}: GetTiposSaidaTableColumnsParams): ColumnDef<TipoSaida>[] {
  return [
    {
      accessorKey: 'descricao',
      header: ({ column }) => (
        <SortableHeader column={column}>Nome</SortableHeader>
      ),
    },
    {
      accessorKey: 'isVenda',
      header: ({ column }) => (
        <SortableHeader column={column}>Tipo</SortableHeader>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isVenda ? 'default' : 'secondary'}>
          {row.original.isVenda ? 'Venda padrão' : 'Outras saídas'}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortableHeader column={column}>Criado em</SortableHeader>
      ),
      cell: ({ row }) => formatDate(row.original.createdAt),
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
