import { z } from 'zod';

export const tipoEntradaSchema = z.object({
  descricao: z.string().min(1, 'Nome é obrigatório'),
  isDoacao: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type TipoEntradaFormData = z.infer<typeof tipoEntradaSchema>;
