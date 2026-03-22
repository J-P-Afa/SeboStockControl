import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  roleId: z.string().min(1, 'Selecione um perfil'),
  isActive: z.boolean().default(true),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .or(z.literal(''))
    .optional(),
  roleId: z.string().min(1, 'Selecione um perfil'),
  isActive: z.boolean(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Tipo único que o formulário usa em qualquer modo
export type UserFormData = CreateUserFormData | UpdateUserFormData;
