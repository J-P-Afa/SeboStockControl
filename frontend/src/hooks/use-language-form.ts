import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Language } from '@/types';
import {
  createLanguageSchema,
  updateLanguageSchema,
  type LanguageFormData,
} from '@/lib/validations/language.schema';

interface UseLanguageFormOptions {
  language?: Language | null;
  open: boolean;
  onSubmit: (data: LanguageFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useLanguageForm({
  language,
  open,
  onSubmit,
  onOpenChange,
}: UseLanguageFormOptions) {
  const isEditing = !!language;

  const form = useForm<LanguageFormData>({
    resolver: zodResolver(
      isEditing ? updateLanguageSchema : createLanguageSchema,
    ) as Resolver<LanguageFormData>,
    defaultValues: {
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (language) {
        form.reset({
          description: language.description,
          isActive: language.isActive,
        });
      } else {
        form.reset({
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, language, form]);

  async function handleFormSubmit(data: LanguageFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
