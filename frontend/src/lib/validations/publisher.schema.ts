import { z } from 'zod';

export const createPublisherSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  isActive: z.boolean().default(true),
});

export type CreatePublisherFormData = z.infer<typeof createPublisherSchema>;

export const updatePublisherSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  isActive: z.boolean(),
});

export type UpdatePublisherFormData = z.infer<typeof updatePublisherSchema>;

export type PublisherFormData = CreatePublisherFormData | UpdatePublisherFormData;
