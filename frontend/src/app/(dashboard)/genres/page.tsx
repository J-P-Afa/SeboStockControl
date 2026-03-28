'use client';

import { Tag } from 'lucide-react';
import { GenreTable } from '@/components/organisms/genre-table';
import { useGenres } from '@/hooks/use-genres';

export default function GenresPage() {
  const { data: genres = [], isLoading } = useGenres();

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gêneros</h1>
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Veja a lista de gêneros cadastrados no sistema.
          </p>
        </div>
      </div>

      <GenreTable
        genres={genres}
        onEdit={() => undefined}
        onDelete={() => undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
