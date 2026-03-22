/**
 * Formata uma string de data ISO para o padrão pt-BR (dd/mm/aaaa).
 *
 * @ai-context Extraído de `users-table.tsx` para centralizar formatação de datas.
 * @param dateStr - String de data no formato ISO 8601.
 * @returns Data formatada em pt-BR.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Trunca um UUID exibindo apenas o primeiro segmento (antes do primeiro '-').
 * Útil para exibir IDs curtos em tabelas sem perder unicidade visual.
 *
 * @example truncateUuid('a1b2c3d4-...') → 'a1b2c3d4'
 * @param id - UUID completo.
 * @returns Primeiro segmento do UUID.
 */
export function truncateUuid(id: string): string {
  return id.split('-')[0];
}

/**
 * Retorna a label de pluralização para um total de registros.
 *
 * @example registrosLabel(1) → '1 registro no total'
 * @example registrosLabel(5) → '5 registros no total'
 */
export function registrosLabel(total: number): string {
  return `${total} registro${total !== 1 ? 's' : ''} no total`;
}
