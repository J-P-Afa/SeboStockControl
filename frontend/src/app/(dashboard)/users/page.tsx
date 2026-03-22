'use client';

import { useState, useCallback, useMemo } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { UsersTable } from '@/components/organisms/users-table';
import { UserFormDialog } from '@/components/molecules/user-form-dialog';
import { DeleteConfirmDialog } from '@/components/molecules/delete-confirm-dialog';
import { UserSearchAutocomplete } from '@/components/molecules/user-search-autocomplete';
import { RoleMultiSelect } from '@/components/molecules/role-multi-select';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/use-users';
import type { User, ListUsersFilters } from '@/types';
import type { CreateUserPayload, UpdateUserPayload } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [search, setSearch] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isActiveFilter, setIsActiveFilter] = useState(true);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' as const : 'asc' as const;

  const filters = useMemo<ListUsersFilters>(
    () => ({
      search: search || undefined,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
      isActive: isActiveFilter,
    }),
    [search, roleIds, isActiveFilter],
  );

  const hasNonDefaultFilters =
    search.length > 0 || roleIds.length > 0 || !isActiveFilter;

  const { data, isLoading } = useUsers(
    page,
    pageSize,
    sortBy,
    sorting.length > 0 ? sortOrder : undefined,
    filters,
  );

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSortingChange = useCallback<React.Dispatch<React.SetStateAction<SortingState>>>(
    (updaterOrValue) => {
      setSorting(updaterOrValue);
      setPage(1);
    },
    [],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleSearchFilterChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleRoleIdsChange = useCallback((ids: string[]) => {
    setRoleIds(ids);
    setPage(1);
  }, []);

  const handleIsActiveChange = useCallback((checked: boolean) => {
    setIsActiveFilter(checked);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleIds([]);
    setIsActiveFilter(true);
    setPage(1);
  }, []);

  function handleEdit(user: User) {
    setSelectedUser(user);
    setFormOpen(true);
  }

  function handleDelete(user: User) {
    setSelectedUser(user);
    setDeleteOpen(true);
  }

  function handleCreate() {
    setSelectedUser(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(
    formData: Record<string, unknown>,
  ) {
    if (selectedUser) {
      const payload: UpdateUserPayload = {};
      if (formData.name) payload.name = formData.name as string;
      if (formData.email) payload.email = formData.email as string;
      if (formData.password) payload.password = formData.password as string;
      if (formData.roleId) payload.roleId = formData.roleId as string;
      if (formData.isActive !== undefined)
        payload.isActive = formData.isActive as boolean;

      await updateMutation.mutateAsync({
        id: selectedUser.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(formData as unknown as CreateUserPayload);
    }
  }

  async function handleDeleteConfirm() {
    if (selectedUser) {
      await deleteMutation.mutateAsync(selectedUser.id);
      setDeleteOpen(false);
      setSelectedUser(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Usuários</h1>
          <p className="text-muted-foreground/80 text-base">
            Gerencie as contas e permissões do sistema.
          </p>
        </div>
        <Button onClick={handleCreate} className="h-11 px-6 shadow-sm shadow-primary/5 hover:shadow-primary/10 transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-1 relative z-20">
        <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
          <UserSearchAutocomplete
            value={search}
            onFilterChange={handleSearchFilterChange}
            roleIds={roleIds}
            isActive={isActiveFilter}
          />
          <RoleMultiSelect
            selectedIds={roleIds}
            onRoleIdsChange={handleRoleIdsChange}
          />
          <div className="h-8 w-[1px] bg-border/40 mx-1 hidden sm:block" />
          <Label className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-background/50 rounded-lg transition-colors">
            <Switch
              checked={isActiveFilter}
              onCheckedChange={handleIsActiveChange}
            />
            <span className="text-sm font-medium">Ativos</span>
          </Label>
          {hasNonDefaultFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground">
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      <UsersTable
        data={data?.items ?? []}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        description={`Tem certeza que deseja excluir o usuário "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
