import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { CanalVenda } from '@/types';
import {
  canalVendaSchema,
  type CanalVendaFormData,
} from '@/lib/validations/canal-venda.schema';

interface UseCanalVendaFormOptions {
  canalVenda?: CanalVenda | null;
  open: boolean;
  onSubmit: (data: CanalVendaFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

function toPercent(value: string | number | null | undefined): number {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (typeof numericValue !== 'number' || !Number.isFinite(numericValue)) {
    return 0;
  }

  return Number((numericValue * 100).toFixed(4));
}

export function useCanalVendaForm({
  canalVenda,
  open,
  onSubmit,
  onOpenChange,
}: UseCanalVendaFormOptions) {
  const isEditing = !!canalVenda;

  const form = useForm<CanalVendaFormData>({
    resolver: zodResolver(canalVendaSchema) as Resolver<CanalVendaFormData>,
    defaultValues: {
      descricao: '',
      comissaoVariavel: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      descricao: canalVenda?.descricao ?? '',
      comissaoVariavel: toPercent(canalVenda?.comissaoVariavel),
      isActive: canalVenda?.isActive ?? true,
    });
  }, [open, canalVenda, form]);

  async function handleFormSubmit(data: CanalVendaFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
