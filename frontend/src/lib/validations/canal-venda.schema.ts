import { z } from 'zod';

export const canalVendaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  comissaoVariavel: z.coerce
    .number()
    .min(0, 'Taxa não pode ser negativa')
    .max(100, 'Taxa não pode ser maior que 100%'),
  isActive: z.boolean().default(true),
});

export type CanalVendaFormData = z.infer<typeof canalVendaSchema>;
