import { useEffect } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Genre } from '@/types';
import {
  createGenreSchema,
  updateGenreSchema,
  type GenreFormData,
} from '@/lib/validations/genre.schema';

interface UseGenreFormOptions {
  genre?: Genre | null;
  open: boolean;
  onSubmit: (data: GenreFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useGenreForm({
  genre,
  open,
  onSubmit,
  onOpenChange,
}: UseGenreFormOptions) {
  const isEditing = !!genre;

  const form = useForm<GenreFormData>({
    resolver: zodResolver(
      isEditing ? updateGenreSchema : createGenreSchema,
    ) as Resolver<GenreFormData>,
    defaultValues: {
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (genre) {
        form.reset({
          description: genre.description,
          isActive: genre.isActive,
        });
      } else {
        form.reset({
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, genre, form]);

  async function handleFormSubmit(data: GenreFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return {
    form,
    isEditing,
    handleFormSubmit,
  };
}