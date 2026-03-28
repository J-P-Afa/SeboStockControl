import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { formatDate } from '@/lib/formatters';
import type { Language } from '@/types';

interface GetLanguageTableColumnsParams {
  onEdit: (language: Language) => void;
  onDelete: (language: Language) => void;
}

export function getLanguageTableColumns({
  onEdit,
  onDelete,
}: GetLanguageTableColumnsParams): ColumnDef<Language>[] {
  return [
    {
      accessorKey: 'description',
      header: () => (
        <span className="text-foreground/80 font-semibold">Idioma</span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Tag size={16} />
          </div>
          <div className="truncate">
            <div className="text-foreground font-medium">{row.original.description}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">
              ID: {row.original.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: () => (
        <span className="text-foreground/80 font-semibold">Status</span>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <span className="text-foreground/80 font-semibold">Criado em</span>
      ),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => (
        <span className="text-foreground/80 font-semibold text-right block">Ações</span>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];
}
