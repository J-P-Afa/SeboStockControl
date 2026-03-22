'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { getRolesTableColumns } from './roles-table-columns';
import type { Role } from '@/types';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  isLoading?: boolean;
}

/**
 * Tabela de perfis de usuário.
 * Exibe nome, permissões e ações de edição/exclusão para cada perfil.
 * 
 * @param props - Propriedades do componente.
 * @param props.roles - Lista de perfis a serem exibidos.
 * @param props.onEdit - Callback acionado ao clicar em editar.
 * @param props.onDelete - Callback acionado ao clicar em excluir.
 * @param props.isLoading - Estado de carregamento da tabela.
 * 
 * @returns Um componente DataTable configurado para a entidade Role.
 * 
 * @ai-context Refatorado para consumir `DataTable<Role>` genérico.
 * Loading/empty states são delegados ao DataTable.
 * A regra de negócio de deletabilidade está encapsulada em `isRoleDeletable` (roles-table-columns).
 */
export function RolesTable({ roles, onEdit, onDelete, isLoading }: RolesTableProps) {
  const columns = useMemo(
    () => getRolesTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={roles}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Carregando perfis..."
      emptyMessage="Nenhum perfil encontrado."
    />
  );
}
