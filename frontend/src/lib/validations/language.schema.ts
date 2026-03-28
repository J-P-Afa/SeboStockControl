import { z } from 'zod';

export const createLanguageSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  isActive: z.boolean().default(true),
});

export type CreateLanguageFormData = z.infer<typeof createLanguageSchema>;

export const updateLanguageSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  isActive: z.boolean(),
});

export type UpdateLanguageFormData = z.infer<typeof updateLanguageSchema>;

export type LanguageFormData = CreateLanguageFormData | UpdateLanguageFormData;
