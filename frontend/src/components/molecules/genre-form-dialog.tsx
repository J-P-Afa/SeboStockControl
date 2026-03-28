'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/atoms/checkbox';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';

import { useGenreForm } from '@/hooks/use-genre-form';

import type { Genre } from '@/types';
import type { GenreFormData } from '@/lib/validations/genre.schema';

interface GenreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genre?: Genre | null;
  onSubmit: (data: GenreFormData) => Promise<void>;
  isLoading?: boolean;
}

export function GenreFormDialog({
  open,
  onOpenChange,
  genre,
  onSubmit,
  isLoading,
}: GenreFormDialogProps) {
  const { form, isEditing, handleFormSubmit } = useGenreForm({
    genre,
    open,
    onSubmit,
    onOpenChange,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Gênero' : 'Novo Gênero'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do gênero.'
              : 'Preencha os dados para criar um novo gênero.'}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* isActive */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', !!checked)}
                className="border-border"
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}