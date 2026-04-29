export interface TipoEntrada {
  id: number;
  descricao: string;
  isDoacao: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTipoEntradaPayload {
  descricao: string;
  isDoacao?: boolean;
  isActive?: boolean;
}

export interface UpdateTipoEntradaPayload {
  descricao?: string;
  isDoacao?: boolean;
  isActive?: boolean;
}
