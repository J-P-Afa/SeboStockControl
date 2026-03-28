'use client';

import { Archive } from 'lucide-react';
import { PublisherTable } from '@/components/organisms/publisher-table';
import { usePublishers } from '@/hooks/use-publishers';

export default function PublishersPage() {
  const { data: publishers = [], isLoading } = usePublishers();

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Editoras</h1>
            <Archive className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground/80">
            Confira as editoras cadastradas no sistema.
          </p>
        </div>
      </div>

      <PublisherTable
        publishers={publishers}
        onEdit={() => undefined}
        onDelete={() => undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
