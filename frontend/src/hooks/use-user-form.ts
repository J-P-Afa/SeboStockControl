import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@/types';
import {
  createUserSchema,
  updateUserSchema,
  type UserFormData,
} from '@/lib/validations/user.schema';

interface UseUserFormOptions {
  user?: User | null;
  open: boolean;
  onSubmit: (data: UserFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useUserForm({
  user,
  open,
  onSubmit,
  onOpenChange,
}: UseUserFormOptions) {
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(
      isEditing ? updateUserSchema : createUserSchema,
    ) as Resolver<UserFormData>,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          name: user.name,
          email: user.email,
          password: '',
          roleId: user.roleId,
          isActive: user.isActive,
        });
      } else {
        form.reset({
          name: '',
          email: '',
          password: '',
          roleId: '',
          isActive: true,
        });
      }
    }
  }, [open, user, form]);

  async function handleFormSubmit(data: UserFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
