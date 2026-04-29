export interface TipoSaida {
  id: number;
  descricao: string;
  isVenda: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTipoSaidaPayload {
  descricao: string;
  isVenda?: boolean;
  isActive?: boolean;
}

export interface UpdateTipoSaidaPayload {
  descricao?: string;
  isVenda?: boolean;
  isActive?: boolean;
}
