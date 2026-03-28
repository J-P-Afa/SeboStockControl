/**
 * @ai-context Entidade de domínio Livro — puro, sem dependências de framework.
 * Encapsula todos os campos do schema v2.3 e as invariantes de negócio.
 */

export enum EdicaoEspecial {
  NORMAL = 'normal',
  VARIANTE = 'variante',
}
export enum EstadoLivro {
  NOVO = 'novo',
  USADO = 'usado',
}
export enum ColecaoLivro {
  COMPLETA = 'completa',
  EM_LANCAMENTO = 'em_lancamento',
}

export interface LivroProps {
  id: number;
  classificacaoId: number;
  editoraId: number;
  idiomaId: number;
  descricao: string;
  capa?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  edicaoEspecial: EdicaoEspecial;
  volume?: string | null;
  estado: EstadoLivro;
  colecao: ColecaoLivro;
  pesoGramas?: number | null;
  precoTabelado?: number | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class LivroEntity {
  private props: LivroProps;

  private constructor(props: LivroProps) {
    this.props = props;
  }

  public static create(props: Omit<LivroProps, 'id' | 'createdAt' | 'updatedAt'>): LivroEntity {
    LivroEntity.validateIsbn(props.isbn13, props.isbn10);
    return new LivroEntity({
      ...props,
      id: 0,
      ativo: props.ativo ?? true,
      edicaoEspecial: props.edicaoEspecial ?? EdicaoEspecial.NORMAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static restore(props: LivroProps): LivroEntity {
    return new LivroEntity(props);
  }

  /** @ai-context RULE [LIV-02]: ISBN deve ter exatamente 13 ou 10 dígitos numéricos. */
  private static validateIsbn(isbn13?: string | null, isbn10?: string | null): void {
    if (isbn13 !== null && isbn13 !== undefined && !/^\d{13}$/.test(isbn13)) {
      throw new Error('ISBN-13 deve conter exatamente 13 dígitos numéricos');
    }
    if (isbn10 !== null && isbn10 !== undefined && !/^\d{10}$/.test(isbn10)) {
      throw new Error('ISBN-10 deve conter exatamente 10 dígitos numéricos');
    }
  }

  get id(): number { return this.props.id; }
  get classificacaoId(): number { return this.props.classificacaoId; }
  get editoraId(): number { return this.props.editoraId; }
  get idiomaId(): number { return this.props.idiomaId; }
  get descricao(): string { return this.props.descricao; }
  get capa(): string | null | undefined { return this.props.capa; }
  get isbn13(): string | null | undefined { return this.props.isbn13; }
  get isbn10(): string | null | undefined { return this.props.isbn10; }
  get edicaoEspecial(): EdicaoEspecial { return this.props.edicaoEspecial; }
  get volume(): string | null | undefined { return this.props.volume; }
  get estado(): EstadoLivro { return this.props.estado; }
  get colecao(): ColecaoLivro { return this.props.colecao; }
  get pesoGramas(): number | null | undefined { return this.props.pesoGramas; }
  get precoTabelado(): number | null | undefined { return this.props.precoTabelado; }
  get ativo(): boolean { return this.props.ativo; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public desativar(): void { this.props.ativo = false; }
  public ativar(): void { this.props.ativo = true; }
}
