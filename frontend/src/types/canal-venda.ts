export interface CanalVenda {
  id: number;
  descricao: string;
  comissaoFixa: string | number;
  comissaoVariavel: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCanalVendaPayload {
  descricao: string;
  comissaoVariavel?: number;
  isActive?: boolean;
}

export interface UpdateCanalVendaPayload {
  descricao?: string;
  comissaoVariavel?: number;
  isActive?: boolean;
}
