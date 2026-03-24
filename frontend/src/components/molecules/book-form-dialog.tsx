'use client';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import type { Book } from '@/types';

export interface BookFormData {
  title: string;
  author: string;
  stock: number;
  price: number;
  publisher?: string;
  edition?: string;
}

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;
  onSubmit: (data: BookFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BookFormDialog({
  open,
  onOpenChange,
  book,
  onSubmit,
  isLoading,
}: BookFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookFormData>({
    defaultValues: {
      title: book?.title ?? '',
      author: book?.author ?? '',
      stock: book?.stock ?? 0,
      price: book?.price ?? 0,
      publisher: book?.publisher ?? '',
      edition: book?.edition ?? '',
    },
  });

  useEffect(() => {
    reset({
      title: book?.title ?? '',
      author: book?.author ?? '',
      stock: book?.stock ?? 0,
      price: book?.price ?? 0,
      publisher: book?.publisher ?? '',
      edition: book?.edition ?? '',
    });
  }, [book, open, reset]);

  const isLowStock = watch('stock') <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{book ? 'Editar Livro' : 'Novo Livro'}</DialogTitle>
          <DialogDescription>
            {book
              ? 'Atualize os dados do livro selecionado.'
              : 'Informe os dados para cadastrar um novo livro.'}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title', { required: 'Título é obrigatório' })} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Autor</Label>
            <Input id="author" {...register('author', { required: 'Autor é obrigatório' })} />
            {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                step={1}
                min={0}
                {...register('stock', {
                  valueAsNumber: true,
                  required: 'Estoque é obrigatório',
                  min: { value: 0, message: 'Estoque não pode ser negativo' },
                })}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step={0.01}
                min={0}
                {...register('price', {
                  valueAsNumber: true,
                  required: 'Preço é obrigatório',
                  min: { value: 0, message: 'Preço não pode ser negativo' },
                })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">Editora</Label>
            <Input id="publisher" {...register('publisher')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edition">Edição</Label>
            <Input id="edition" {...register('edition')} />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="low-stock" checked={isLowStock} disabled />
            <span className="text-sm text-muted-foreground">Estoque está baixo</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {book ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
