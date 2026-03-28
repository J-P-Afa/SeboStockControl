import { Prisma } from '@prisma/client';

export interface EstoqueProps {
  bookId: number;
  quantidade: number;
  custoMedio: Prisma.Decimal;
  dataUltimaEntrada?: Date | null;
  dataUltimaSaida?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EstoqueEntity {
  private props: EstoqueProps;

  private constructor(props: EstoqueProps) {
    this.props = props;
  }

  public static restore(props: EstoqueProps): EstoqueEntity {
    return new EstoqueEntity(props);
  }

  public static create(bookId: number): EstoqueEntity {
    return new EstoqueEntity({
      bookId,
      quantidade: 0,
      custoMedio: new Prisma.Decimal(0),
    });
  }

  get custoTotal(): Prisma.Decimal {
    return this.props.custoMedio.mul(this.props.quantidade);
  }


  /**
   * Aplica o algoritmo WACC (Custo Médio Ponderado)
   * RULE [ENT-01]
   */
  public applyEntrada(quantidade: number, custoUnitarioInput: Prisma.Decimal | number | string): void {
    const custoUnitario = new Prisma.Decimal(custoUnitarioInput);
    const qtdAtual = this.props.quantidade;

    const custoAtual = this.props.custoMedio;

    if (custoUnitario.isZero()) {
      // Doação: não altera custo médio
      this.props.quantidade += quantidade;
    } else {
      // Formula: (qtdAtual * custoAtual + qtdNova * custoNovo) / (qtdAtual + qtdNova)
      const novoCusto = custoAtual
        .mul(qtdAtual)
        .add(custoUnitario.mul(quantidade))
        .div(qtdAtual + quantidade);

      this.props.custoMedio = novoCusto;
      this.props.quantidade += quantidade;
    }
    
    this.props.dataUltimaEntrada = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Decrementa a quantidade em estoque
   * RULE [SAI-04]
   */
  public decrement(quantidade: number): void {
    if (this.props.quantidade < quantidade) {
      throw new Error('ESTOQUE_INSUFICIENTE');
    }
    this.props.quantidade -= quantidade;
    this.props.dataUltimaSaida = new Date();
    this.props.updatedAt = new Date();
  }

  get bookId(): number { return this.props.bookId; }
  get quantidade(): number { return this.props.quantidade; }
  get custoMedio(): Prisma.Decimal { return this.props.custoMedio; }
  get dataUltimaEntrada(): Date | null | undefined { return this.props.dataUltimaEntrada; }
  get dataUltimaSaida(): Date | null | undefined { return this.props.dataUltimaSaida; }
  
  public toJSON() {
    return {
      bookId: this.props.bookId,
      quantidade: this.props.quantidade,
      custoMedio: this.props.custoMedio,
      dataUltimaEntrada: this.props.dataUltimaEntrada,
      dataUltimaSaida: this.props.dataUltimaSaida,
    };
  }
}
