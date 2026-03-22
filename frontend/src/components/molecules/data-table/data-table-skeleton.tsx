interface DataTableSkeletonProps {
  /** Mensagem exibida abaixo do spinner. Padrão: "Carregando..." */
  message?: string;
}

/**
 * Estado de carregamento centralizado com spinner animado.
 * Substitui o loading state inline do `roles-table`.
 *
 * @ai-context Extraído de `roles-table.tsx`. Reutilizável em qualquer `DataTable<T>`.
 */
export function DataTableSkeleton({
  message = 'Carregando...',
}: DataTableSkeletonProps) {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-foreground/5 backdrop-blur-md rounded-2xl border border-border/50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}
