import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { TipoSaida } from '@/types';
import {
  tipoSaidaSchema,
  type TipoSaidaFormData,
} from '@/lib/validations/tipo-saida.schema';

interface UseTipoSaidaFormOptions {
  tipoSaida?: TipoSaida | null;
  open: boolean;
  onSubmit: (data: TipoSaidaFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useTipoSaidaForm({
  tipoSaida,
  open,
  onSubmit,
  onOpenChange,
}: UseTipoSaidaFormOptions) {
  const isEditing = !!tipoSaida;

  const form = useForm<TipoSaidaFormData>({
    resolver: zodResolver(tipoSaidaSchema) as Resolver<TipoSaidaFormData>,
    defaultValues: {
      descricao: '',
      isVenda: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      descricao: tipoSaida?.descricao ?? '',
      isVenda: tipoSaida?.isVenda ?? false,
      isActive: tipoSaida?.isActive ?? true,
    });
  }, [open, tipoSaida, form]);

  async function handleFormSubmit(data: TipoSaidaFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
