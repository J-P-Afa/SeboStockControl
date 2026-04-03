'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/molecules/select';
import { registrosLabel } from '@/lib/formatters';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Barra de paginação reutilizável para qualquer `DataTable<T>`.
 * Exibe total de registros, seletor de tamanho de página e botões de navegação.
 *
 * @ai-context Extraído da seção de paginação de `users-table.tsx` (linhas 233-280).
 */
export function DataTablePagination({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationConfig) {
  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">{registrosLabel(total)}</p>

      <nav aria-label="Paginação" className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Registros por página</span>
          <Select
            value={pageSize}
            onValueChange={(val) => onPageSizeChange(val as number)}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
