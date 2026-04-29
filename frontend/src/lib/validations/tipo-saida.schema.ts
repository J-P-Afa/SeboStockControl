import { z } from 'zod';

export const tipoSaidaSchema = z.object({
  descricao: z.string().min(1, 'Nome é obrigatório'),
  isVenda: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type TipoSaidaFormData = z.infer<typeof tipoSaidaSchema>;
