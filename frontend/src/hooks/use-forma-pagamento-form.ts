import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { FormaPagamento } from '@/types';
import {
  formaPagamentoSchema,
  type FormaPagamentoFormData,
} from '@/lib/validations/forma-pagamento.schema';

interface UseFormaPagamentoFormOptions {
  formaPagamento?: FormaPagamento | null;
  open: boolean;
  onSubmit: (data: FormaPagamentoFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

function toPercent(value: string | number | null | undefined): number {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (typeof numericValue !== 'number' || !Number.isFinite(numericValue)) {
    return 0;
  }

  return Number((numericValue * 100).toFixed(4));
}

export function useFormaPagamentoForm({
  formaPagamento,
  open,
  onSubmit,
  onOpenChange,
}: UseFormaPagamentoFormOptions) {
  const isEditing = !!formaPagamento;

  const form = useForm<FormaPagamentoFormData>({
    resolver: zodResolver(
      formaPagamentoSchema,
    ) as Resolver<FormaPagamentoFormData>,
    defaultValues: {
      descricao: '',
      taxa: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      descricao: formaPagamento?.descricao ?? '',
      taxa: toPercent(formaPagamento?.taxa),
      isActive: formaPagamento?.isActive ?? true,
    });
  }, [open, formaPagamento, form]);

  async function handleFormSubmit(data: FormaPagamentoFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
