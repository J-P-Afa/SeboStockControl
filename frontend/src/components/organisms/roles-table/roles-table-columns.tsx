import type { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { PermissionBadge } from '@/components/molecules/permission-badge';
import { truncateUuid } from '@/lib/formatters';
import type { Role } from '@/types';

interface UseRolesTableColumnsParams {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

/**
 * Verifica se um perfil pode ser excluído.
 * O perfil ADMIN é protegido e não pode ser removido.
 *
 * @ai-context Encapsula a regra de negócio que estava hardcoded na view (`role.name === "ADMIN"`).
 * @side-effects Nenhum.
 */
function isRoleDeletable(role: Role): boolean {
  return role.name !== 'ADMIN';
}

/**
 * Define as colunas da tabela de perfis para uso com `DataTable<Role>`.
 * Separado do componente de renderização para seguir o princípio de responsabilidade única.
 *
 * @ai-context Colocation — mantido na mesma pasta que `roles-table.tsx`.
 */
export function getRolesTableColumns({
  onEdit,
  onDelete,
}: UseRolesTableColumnsParams): ColumnDef<Role>[] {
  return [
    {
      accessorKey: 'name',
      header: () => (
        <span className="text-foreground/80 font-semibold">Nome do Perfil</span>
      ),
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-foreground font-medium">{role.name}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                ID: {truncateUuid(role.id)}...
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'permissions',
      header: () => (
        <span className="text-foreground/80 font-semibold">Permissões</span>
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5 max-w-[400px]">
          {row.original.permissions.map((p) => (
            <PermissionBadge key={p.id} action={p.action} label={p.description} />
          ))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => (
        <span className="text-foreground/80 font-semibold text-right block">Ações</span>
      ),
      cell: ({ row }) => {
        const role = row.original;
        const deletable = isRoleDeletable(role);
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(role)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(role)}
              className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
              disabled={!deletable}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ];
}
