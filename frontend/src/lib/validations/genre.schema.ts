import { z } from 'zod';

export const createGenreSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  isActive: z.boolean().default(true),
});

export type CreateGenreFormData = z.infer<typeof createGenreSchema>;

export const updateGenreSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  isActive: z.boolean(),
});

export type UpdateGenreFormData = z.infer<typeof updateGenreSchema>;

// Tipo único que o formulário usa em qualquer modo
export type GenreFormData = CreateGenreFormData | UpdateGenreFormData;