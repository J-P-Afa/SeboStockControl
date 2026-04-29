'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import { useTipoSaidaForm } from '@/hooks/use-tipo-saida-form';
import type { TipoSaida } from '@/types';
import type { TipoSaidaFormData } from '@/lib/validations/tipo-saida.schema';

interface TipoSaidaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoSaida?: TipoSaida | null;
  onSubmit: (data: TipoSaidaFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TipoSaidaFormDialog({
  open,
  onOpenChange,
  tipoSaida,
  onSubmit,
  isLoading,
}: TipoSaidaFormDialogProps) {
  const { form, isEditing, handleFormSubmit } = useTipoSaidaForm({
    tipoSaida,
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

  const isVenda = watch('isVenda');
  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Tipo de Saída' : 'Novo Tipo de Saída'}
          </DialogTitle>
          <DialogDescription>
            Defina como as saídas serão classificadas no estoque.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="descricao">Nome</Label>
            <Input
              id="descricao"
              placeholder="Ex.: Venda balcão"
              {...register('descricao')}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isVenda"
                checked={isVenda}
                onCheckedChange={(checked) => setValue('isVenda', !!checked)}
              />
              <Label htmlFor="isVenda">Venda padrão</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', !!checked)}
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
