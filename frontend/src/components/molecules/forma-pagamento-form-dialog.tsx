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
import { useFormaPagamentoForm } from '@/hooks/use-forma-pagamento-form';
import type { FormaPagamento } from '@/types';
import type { FormaPagamentoFormData } from '@/lib/validations/forma-pagamento.schema';

interface FormaPagamentoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formaPagamento?: FormaPagamento | null;
  onSubmit: (data: FormaPagamentoFormData) => Promise<void>;
  isLoading?: boolean;
}

export function FormaPagamentoFormDialog({
  open,
  onOpenChange,
  formaPagamento,
  onSubmit,
  isLoading,
}: FormaPagamentoFormDialogProps) {
  const { form, isEditing, handleFormSubmit } = useFormaPagamentoForm({
    formaPagamento,
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
            {isEditing
              ? 'Editar Forma de Pagamento'
              : 'Nova Forma de Pagamento'}
          </DialogTitle>
          <DialogDescription>
            Informe os dados usados nas vendas e saídas.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Ex.: Pix"
              {...register('descricao')}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxa">Taxa (%)</Label>
            <Input
              id="taxa"
              min={0}
              max={100}
              step={0.01}
              type="number"
              {...register('taxa', { valueAsNumber: true })}
            />
            {errors.taxa && (
              <p className="text-sm text-destructive">
                {errors.taxa.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', !!checked)}
            />
            <Label htmlFor="isActive">Ativo</Label>
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
