'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/atoms/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/molecules/select';
import { useRoles } from '@/hooks/use-users';
import { useUserForm } from '@/hooks/use-user-form';
import type { User } from '@/types';
import type { UserFormData } from '@/lib/validations/user.schema';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: UserFormDialogProps) {
  const { data: roles } = useRoles();
  const { form, isEditing, handleFormSubmit } = useUserForm({
    user,
    open,
    onSubmit,
    onOpenChange,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedRoleId = watch('roleId');
  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do usuário.'
              : 'Preencha os dados para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Senha{isEditing && ' (deixe em branco para manter)'}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select
              value={selectedRoleId ?? ''}
              onValueChange={(value) => setValue('roleId', value ?? '')}
              items={
                Array.isArray(roles)
                  ? roles.map((role) => ({
                      value: role.id,
                      label: role.name,
                    }))
                  : []
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {Array.isArray(roles) &&
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-sm text-destructive">
                {errors.roleId.message}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', !!checked)}
                className="border-border"
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
