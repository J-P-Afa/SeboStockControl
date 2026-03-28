'use client';

import { Loader2, Search } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/molecules/select';
import { EditionType, Condition, Status, type Book } from '@/types';
import { usePublishers } from '@/hooks/use-publishers';
import { useLanguages } from '@/hooks/use-languages';
import { useGenres } from '@/hooks/use-genres';
import { lookupExternalBook } from '@/lib/api/books.api';
import type { ExternalBook } from '@/types/books';

export interface BookFormData {
  title: string;
  subtitle?: string | null;
  author?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  listPrice?: number | null;
  editionType: EditionType;
  volume?: string | null;
  condition: Condition;
  status: Status;
  weight: number;
  publisherId: string;
  languageId: string;
  genreId: string;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  dimensions?: string | null;
}

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;
  externalBook?: ExternalBook | null;
  onSubmit: (data: BookFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BookFormDialog({
  open,
  onOpenChange,
  book,
  externalBook,
  onSubmit,
  isLoading,
}: BookFormDialogProps) {
  const { data: publishers, refetch: refetchPublishers } = usePublishers();
  const { data: languages, refetch: refetchLanguages } = useLanguages();
  const { data: genres, refetch: refetchGenres } = useGenres();
  const [isFetching, setIsFetching] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      author: '',
      isbn13: '',
      isbn10: '',
      listPrice: 0,
      editionType: EditionType.NORMAL,
      condition: Condition.NOVO,
      status: Status.COMPLETO,
      weight: 0,
      publisherId: '',
      languageId: '',
      genreId: '',
      volume: '',
      publicationYear: null,
      pages: null,
      synopsis: '',
      dimensions: '',
    },
  });

  const updateFormWithExternalData = useCallback((ext: ExternalBook) => {
    setValue('title', ext.title, { shouldDirty: true });
    if (ext.subtitle) setValue('subtitle', ext.subtitle, { shouldDirty: true });
    if (ext.authors.length > 0) setValue('author', ext.authors.join(', '), { shouldDirty: true });
    if (ext.isbn13) setValue('isbn13', ext.isbn13, { shouldDirty: true });
    if (ext.isbn10) setValue('isbn10', ext.isbn10, { shouldDirty: true });
    if (ext.publicationYear) setValue('publicationYear', ext.publicationYear, { shouldDirty: true });
    if (ext.pages) setValue('pages', ext.pages, { shouldDirty: true });
    if (ext.synopsis) setValue('synopsis', ext.synopsis, { shouldDirty: true });
    
    if (ext.publisherId) setValue('publisherId', ext.publisherId.toString(), { shouldDirty: true });
    if (ext.languageId) setValue('languageId', ext.languageId.toString(), { shouldDirty: true });
    if (ext.genreId) setValue('genreId', ext.genreId.toString(), { shouldDirty: true });
  }, [setValue]);

  useEffect(() => {
    if (open) {
      reset({
        title: book?.title ?? externalBook?.title ?? '',
        subtitle: book?.subtitle ?? externalBook?.subtitle ?? '',
        author: book?.author ?? externalBook?.authors?.join(', ') ?? '',
        isbn13: book?.isbn13 ?? externalBook?.isbn13 ?? '',
        isbn10: book?.isbn10 ?? externalBook?.isbn10 ?? '',
        listPrice: book?.listPrice ? Number(book.listPrice) : 0,
        editionType: (book?.editionType as EditionType) ?? EditionType.NORMAL,
        condition: (book?.condition as Condition) ?? Condition.NOVO,
        status: (book?.status as Status) ?? Status.COMPLETO,
        weight: book?.weight ? Number(book.weight) : 0,
        publisherId: book?.publisherId?.toString() ?? externalBook?.publisherId?.toString() ?? '',
        languageId: book?.languageId?.toString() ?? externalBook?.languageId?.toString() ?? '',
        genreId: book?.genreId?.toString() ?? externalBook?.genreId?.toString() ?? '',
        volume: book?.volume ?? '',
        publicationYear: book?.publicationYear ?? externalBook?.publicationYear ?? null,
        pages: book?.pages ?? externalBook?.pages ?? null,
        synopsis: book?.synopsis ?? externalBook?.synopsis ?? '',
        dimensions: book?.dimensions ?? '',
      });
    }
  }, [book, externalBook, open, reset]);

  const handleExternalLookup = async () => {
    const isbn = getValues('isbn13') || getValues('isbn10');
    if (!isbn || isbn.length < 10) {
      toast.error('Informe um ISBN válido para buscar');
      return;
    }

    setIsFetching(true);
    try {
      const result = await lookupExternalBook(isbn);
      if (result) {
        await Promise.all([
          refetchPublishers(),
          refetchLanguages(),
          refetchGenres()
        ]);

        updateFormWithExternalData(result);
        toast.success('Dados importados e cadastrados localmente!');
      } else {
        toast.info('Nenhum dado encontrado na Open Library para este ISBN');
      }
    } catch (error) {
      toast.error('Erro ao buscar dados na Open Library');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book ? 'Editar Livro' : 'Novo Livro'}</DialogTitle>
          <DialogDescription>
            {book
              ? 'Atualize os dados técnicos do livro.'
              : 'Cadastre um novo livro na biblioteca.'}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Título *</Label>
                {!book && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] uppercase font-bold text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={handleExternalLookup}
                    disabled={isFetching}
                  >
                    {isFetching ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Search className="h-3 w-3 mr-1" />}
                    Buscar na Open Library
                  </Button>
                )}
              </div>
              <Input id="title" {...register('title', { required: 'Obrigatório' })} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autor</Label>
              <Input id="author" {...register('author')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input id="subtitle" {...register('subtitle')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn13">ISBN-13</Label>
              <Input id="isbn13" {...register('isbn13', { pattern: { value: /^\d{13}$/, message: '13 dígitos' } })} />
              {errors.isbn13 && <p className="text-xs text-destructive">{errors.isbn13.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn10">ISBN-10</Label>
              <Input id="isbn10" {...register('isbn10', { pattern: { value: /^\d{10}$/, message: '10 dígitos' } })} />
              {errors.isbn10 && <p className="text-xs text-destructive">{errors.isbn10.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Estado *</Label>
              <Controller
                name="condition"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Condition.NOVO}>Novo</SelectItem>
                      <SelectItem value={Condition.USADO}>Usado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Edição *</Label>
              <Controller
                name="editionType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EditionType.NORMAL}>Normal</SelectItem>
                      <SelectItem value={EditionType.VARIANTE}>Variante</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (g) *</Label>
              <Input id="weight" type="number" {...register('weight', { valueAsNumber: true, required: 'Obrigatório' })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="listPrice">Preço Base</Label>
              <Input id="listPrice" type="number" step="0.01" {...register('listPrice', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Editora *</Label>
              <Controller
                name="publisherId"
                control={control}
                rules={{ required: 'Obrigatório' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione">
                        {publishers?.find(p => p.id.toString() === field.value)?.description}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {publishers?.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Idioma *</Label>
              <Controller
                name="languageId"
                control={control}
                rules={{ required: 'Obrigatório' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione">
                        {languages?.find(l => l.id.toString() === field.value)?.description}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {languages?.map(l => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Gênero *</Label>
              <Controller
                name="genreId"
                control={control}
                rules={{ required: 'Obrigatório' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione">
                        {genres?.find(g => g.id.toString() === field.value)?.description}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {genres?.map(g => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status *</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Status.COMPLETO}>Completo</SelectItem>
                      <SelectItem value={Status.EM_LANCAMENTO}>Em Lançamento</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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
