'use client';

import { ImageIcon, Loader2, Search, Trash2, Upload } from 'lucide-react';
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
import { lookupExternalBook, resolveBookCoverUrl } from '@/lib/api/books.api';
import type { ExternalBook } from '@/types/books';

export interface BookFormData {
  title: string;
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
  coverFile?: File | null;
  externalCoverUrl?: string | null;
  removeCover?: boolean;
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
  const { data: publishers, refetch: refetchPublishers } = usePublishers(1, 100);
  const { data: languages, refetch: refetchLanguages } = useLanguages(1, 100);
  const { data: genres, refetch: refetchGenres } = useGenres(1, 100);
  const [isFetching, setIsFetching] = useState(false);
  const [externalCoverUrl, setExternalCoverUrl] = useState<string | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedCoverPreview, setSelectedCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

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
    if (ext.isbn13) setValue('isbn13', ext.isbn13, { shouldDirty: true });
    if (ext.isbn10) setValue('isbn10', ext.isbn10, { shouldDirty: true });
    if (ext.publicationYear) setValue('publicationYear', ext.publicationYear, { shouldDirty: true });
    if (ext.pages) setValue('pages', ext.pages, { shouldDirty: true });
    if (ext.synopsis) setValue('synopsis', ext.synopsis, { shouldDirty: true });
    setExternalCoverUrl(ext.coverUrl ?? null);
    setRemoveCover(false);
    
    if (ext.publisherId) setValue('publisherId', ext.publisherId.toString(), { shouldDirty: true });
    if (ext.languageId) setValue('languageId', ext.languageId.toString(), { shouldDirty: true });
    if (ext.genreId) setValue('genreId', ext.genreId.toString(), { shouldDirty: true });
  }, [setValue]);

  useEffect(() => {
    if (open && externalBook) {
      // If we have external book data, ensure we have the latest auxiliary lists
      // as the backend might have just created new publishers/genres/languages
      Promise.all([
        refetchPublishers(),
        refetchLanguages(),
        refetchGenres()
      ]);
    }

    if (open) {
      reset({
        title: book?.title ?? externalBook?.title ?? '',
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
      setExternalCoverUrl(book ? null : externalBook?.coverUrl ?? null);
      setSelectedCoverFile(null);
      setSelectedCoverPreview(null);
      setRemoveCover(false);
    }
  }, [book, externalBook, open, reset, refetchPublishers, refetchLanguages, refetchGenres]);

  useEffect(() => {
    if (!selectedCoverFile) {
      setSelectedCoverPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedCoverFile);
    setSelectedCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedCoverFile]);

  const currentCoverUrl = removeCover
    ? null
    : selectedCoverPreview ??
      resolveBookCoverUrl(externalCoverUrl ?? book?.coverUrl ?? null);

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedCoverFile(file);
    if (file) setRemoveCover(false);
  };

  const handleRemoveCover = () => {
    setSelectedCoverFile(null);
    setSelectedCoverPreview(null);
    setExternalCoverUrl(null);
    setRemoveCover(true);
  };

  const handleFormSubmit = (data: BookFormData) =>
    onSubmit({
      ...data,
      coverFile: selectedCoverFile,
      externalCoverUrl: selectedCoverFile ? null : externalCoverUrl,
      removeCover,
    });

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
    } catch {
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
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <div className="space-y-3 rounded-lg border border-border bg-background/40 p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="isbn13">ISBN-13</Label>
                  <Input id="isbn13" {...register('isbn13', { pattern: { value: /^\d{13}$/, message: '13 dígitos' } })} />
                  {errors.isbn13 && <p className="text-xs text-destructive">{errors.isbn13.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn10">ISBN-10</Label>
                  <Input id="isbn10" {...register('isbn10', { pattern: { value: /^\d{9}[\dX]$/i, message: '10 dígitos (pode terminar em X)' } })} />
                  {errors.isbn10 && <p className="text-xs text-destructive">{errors.isbn10.message}</p>}
                </div>
              </div>

              <Button
                type="button"
                variant="default"
                size="lg"
                className="mt-0 w-full md:mt-7 md:w-auto"
                onClick={handleExternalLookup}
                disabled={isFetching}
              >
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar na Open Library
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="h-36 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {currentCoverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentCoverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor="cover-file"
                className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-background/50 px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                Capa
              </label>
              <input
                id="cover-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleCoverFileChange}
              />
              {(currentCoverUrl || book?.coverUrl) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCover}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" {...register('title', { required: 'Obrigatório' })} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Estado *</Label>
              <Controller
                name="condition"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Condition.NOVO}>Novo</SelectItem>
                      <SelectItem value={Condition.USADO}>Usado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.condition && <p className="text-xs text-destructive">Obrigatório</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editionType">Edição *</Label>
              <Controller
                name="editionType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="editionType">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EditionType.NORMAL}>Normal</SelectItem>
                      <SelectItem value={EditionType.VARIANTE}>Variante</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.editionType && <p className="text-xs text-destructive">Obrigatório</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input id="volume" {...register('volume')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (g) *</Label>
              <Input id="weight" type="number" {...register('weight', { valueAsNumber: true, required: 'Obrigatório' })} />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="listPrice">Preço Base</Label>
              <Input id="listPrice" type="number" step="0.01" {...register('listPrice', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisherId">Editora</Label>
              <Controller
                name="publisherId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger id="publisherId">
                      <SelectValue placeholder="Selecione">
                        {publishers?.items.find(p => p.id.toString() === field.value)?.description}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {publishers?.items.map(p => (
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
              <Label htmlFor="languageId">Idioma</Label>
              <Controller
                name="languageId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger id="languageId">
                      <SelectValue placeholder="Selecione">
                        {languages?.items.find(l => l.id.toString() === field.value)?.description}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {languages?.items.map(l => (
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
              <Label htmlFor="genreId">Gênero</Label>
              <Controller
                name="genreId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger id="genreId">
                      <SelectValue placeholder="Selecione">
                        {genres?.items.find(g => g.id.toString() === field.value)?.description}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {genres?.items.map(g => (
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
              <Label htmlFor="status">Status *</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Status.COMPLETO}>Completo</SelectItem>
                      <SelectItem value={Status.EM_LANCAMENTO}>Em Lançamento</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-xs text-destructive">Obrigatório</p>}
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
