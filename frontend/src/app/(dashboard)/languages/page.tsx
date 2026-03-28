'use client';

import { Globe } from 'lucide-react';
import { LanguageTable } from '@/components/organisms/language-table';
import { useLanguages } from '@/hooks/use-languages';

export default function LanguagesPage() {
  const { data: languages = [], isLoading } = useLanguages();

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Idiomas</h1>
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Visualize os idiomas disponíveis no sistema.
          </p>
        </div>
      </div>

      <LanguageTable
        languages={languages}
        onEdit={() => undefined}
        onDelete={() => undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
