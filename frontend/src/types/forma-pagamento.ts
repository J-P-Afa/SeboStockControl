export interface FormaPagamento {
  id: number;
  descricao: string;
  taxa: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormaPagamentoPayload {
  descricao: string;
  taxa?: number;
  isActive?: boolean;
}

export interface UpdateFormaPagamentoPayload {
  descricao?: string;
  taxa?: number;
  isActive?: boolean;
}
