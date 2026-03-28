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
import { useLanguageForm } from '@/hooks/use-language-form';
import type { Language } from '@/types';
import type { LanguageFormData } from '@/lib/validations/language.schema';

interface LanguageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language | null;
  onSubmit: (data: LanguageFormData) => Promise<void>;
  isLoading?: boolean;
}

export function LanguageFormDialog({
  open,
  onOpenChange,
  language,
  onSubmit,
  isLoading,
}: LanguageFormDialogProps) {
  const { form, isEditing, handleFormSubmit } = useLanguageForm({
    language,
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
            {isEditing ? 'Editar Idioma' : 'Novo Idioma'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do idioma.'
              : 'Preencha os dados para criar um novo idioma.'}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', !!checked)}
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
