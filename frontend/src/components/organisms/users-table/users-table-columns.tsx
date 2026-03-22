import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { SortableHeader } from '@/components/molecules/data-table';
import { formatDate } from '@/lib/formatters';
import type { User } from '@/types';

interface GetUsersTableColumnsParams {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

/**
 * Define as colunas da tabela de usuários para uso com `DataTable<User>`.
 * Separado do componente de renderização para seguir o princípio de responsabilidade única.
 *
 * @ai-context Extraído do `useMemo` de `users-table.tsx` (linhas 107-173).
 * @side-effects Nenhum. Callbacks (onEdit, onDelete) são recebidos por injeção de dependência.
 */
export function getUsersTableColumns({
  onEdit,
  onDelete,
}: GetUsersTableColumnsParams): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column}>Nome</SortableHeader>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <SortableHeader column={column}>Email</SortableHeader>
      ),
    },
    {
      accessorKey: 'roleName',
      header: ({ column }) => (
        <SortableHeader column={column}>Perfil</SortableHeader>
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
