import type { Book } from './books';
import type { User } from './user';
import type { TipoSaida } from './tipo-saida';
import type { CanalVenda } from './canal-venda';
import type { FormaPagamento } from './forma-pagamento';

export interface Saida {
  id: number;
  bookId: number;
  usuarioId: string;
  tipoSaidaId: number;
  canalVendaId?: number;
  formaPagamentoId?: number;
  dataSaida: string;
  quantidade: number;
  valorUnitario: number;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  book?: Book;
  usuario?: User;
  tipoSaida?: TipoSaida;
  canalVenda?: CanalVenda;
  formaPagamento?: FormaPagamento;
}

export interface CreateSaidaDto {
  bookId: number;
  usuarioId: string;
  tipoSaidaId: number;
  canalVendaId?: number;
  formaPagamentoId?: number;
  dataSaida: string;
  quantidade: number;
  valorUnitario: number;
  observacao?: string;
}

export interface CreateSaidaBulkDto {
  items: CreateSaidaDto[];
}
