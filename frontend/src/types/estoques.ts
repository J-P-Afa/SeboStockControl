export interface EstoqueHistoryEntry {
  data: string; // ISO date string coming from API
  tipoTransacao: string;
  quantidade: number;
  saldoPosTransacao: number;
  observacao?: string | null;
  responsavel: string;
}

export interface EstoqueHistoryResponse {
  bookId: number;
  items: EstoqueHistoryEntry[];
}
