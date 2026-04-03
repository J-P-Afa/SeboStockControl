interface DataTableSkeletonProps {
  /** Mensagem exibida abaixo do spinner. Padrão: "Carregando..." */
  message?: string;
  /** Número de colunas a serem simuladas. Padrão: 5 */
  columnCount?: number;
  /** Número de linhas a serem simuladas. Padrão: 5 */
  rowCount?: number;
}

/**
 * Estado de carregamento centralizado com spinner animado e estrutura de tabela.
 * Isso garante que o Playwright e leitores de tela identifiquem a tabela mesmo durante o loading.
 *
 * @ai-context Extraído de `roles-table.tsx`. Reutilizável em qualquer `DataTable<T>`.
 */
export function DataTableSkeleton({
  message = 'Carregando...',
  columnCount = 5,
  rowCount = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full relative glass noise-bg rounded-2xl overflow-hidden border border-border/50">
      <table className="w-full caption-bottom text-sm">
        <thead className="bg-muted/20">
          <tr className="border-b border-border/50 transition-colors">
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle font-semibold whitespace-nowrap text-muted-foreground/80">
                <div className="h-4 w-24 bg-foreground/5 animate-pulse rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <tr key={i} className="border-b border-border/20 transition-colors">
              {Array.from({ length: columnCount }).map((_, j) => (
                <td key={j} className="p-4 align-middle whitespace-nowrap">
                  <div className="h-4 w-full bg-foreground/5 animate-pulse rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Overlay com Spinner */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] z-10">
        <div className="flex flex-col items-center gap-3 bg-card/80 p-6 rounded-2xl shadow-xl border border-border/50">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground font-medium text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
