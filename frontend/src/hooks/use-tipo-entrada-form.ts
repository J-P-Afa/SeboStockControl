import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { TipoEntrada } from '@/types';
import {
  tipoEntradaSchema,
  type TipoEntradaFormData,
} from '@/lib/validations/tipo-entrada.schema';

interface UseTipoEntradaFormOptions {
  tipoEntrada?: TipoEntrada | null;
  open: boolean;
  onSubmit: (data: TipoEntradaFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useTipoEntradaForm({
  tipoEntrada,
  open,
  onSubmit,
  onOpenChange,
}: UseTipoEntradaFormOptions) {
  const isEditing = !!tipoEntrada;

  const form = useForm<TipoEntradaFormData>({
    resolver: zodResolver(tipoEntradaSchema) as Resolver<TipoEntradaFormData>,
    defaultValues: {
      descricao: '',
      isDoacao: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      descricao: tipoEntrada?.descricao ?? '',
      isDoacao: tipoEntrada?.isDoacao ?? false,
      isActive: tipoEntrada?.isActive ?? true,
    });
  }, [open, tipoEntrada, form]);

  async function handleFormSubmit(data: TipoEntradaFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
