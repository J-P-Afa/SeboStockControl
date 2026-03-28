import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSaidaDto {
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsInt()
  @IsNotEmpty()
  tipoSaidaId: number;

  /** Obrigatório se tipo_saida.isVenda = TRUE (RULE SAI-02) */
  @IsOptional()
  @IsInt()
  canalVendaId?: number;

  /** Obrigatório se tipo_saida.isVenda = TRUE (RULE SAI-02) */
  @IsOptional()
  @IsInt()
  formaPagamentoId?: number;

  @IsDateString()
  dataSaida: string;

  @IsInt()
  @Min(1)
  quantidade: number;

  /** = 0 se não for venda (RULE SAI-03); > 0 se for venda (RULE SAI-02) */
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}
