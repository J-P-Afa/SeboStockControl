import { TableCell, TableRow } from '@/components/atoms/table';

interface DataTableEmptyProps {
  colSpan: number;
  /** Mensagem exibida quando não há registros. Padrão: "Nenhum registro encontrado." */
  message?: string;
}

/**
 * Linha de estado vazio para tabelas.
 * Centraliza e padroniza o empty state para todos os `DataTable<T>`.
 *
 * @ai-context Extraído do padrão inline dos componentes de tabela.
 */
export function DataTableEmpty({
  colSpan,
  message = 'Nenhum registro encontrado.',
}: DataTableEmptyProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  );
}
