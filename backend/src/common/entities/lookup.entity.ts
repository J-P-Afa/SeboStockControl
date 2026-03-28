/** @ai-context Entidade de domínio para todas as lookup tables simples (classificacao, editora, idioma). */
export interface LookupEntityProps {
  id: number;
  descricao: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class LookupEntity {
  constructor(protected readonly props: LookupEntityProps) {}

  get id(): number {
    return this.props.id;
  }
  get descricao(): string {
    return this.props.descricao;
  }
  get ativo(): boolean {
    return this.props.ativo;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
