import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Publisher } from '@/types';
import {
  createPublisherSchema,
  updatePublisherSchema,
  type PublisherFormData,
} from '@/lib/validations/publisher.schema';

interface UsePublisherFormOptions {
  publisher?: Publisher | null;
  open: boolean;
  onSubmit: (data: PublisherFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function usePublisherForm({
  publisher,
  open,
  onSubmit,
  onOpenChange,
}: UsePublisherFormOptions) {
  const isEditing = !!publisher;

  const form = useForm<PublisherFormData>({
    resolver: zodResolver(
      isEditing ? updatePublisherSchema : createPublisherSchema,
    ) as Resolver<PublisherFormData>,
    defaultValues: {
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (publisher) {
        form.reset({
          description: publisher.description,
          isActive: publisher.isActive,
        });
      } else {
        form.reset({
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, publisher, form]);

  async function handleFormSubmit(data: PublisherFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}
