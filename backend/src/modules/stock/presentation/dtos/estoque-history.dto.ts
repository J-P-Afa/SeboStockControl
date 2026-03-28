export class EstoqueHistoryEntryDto {
  data!: Date;
  tipoTransacao!: string;
  quantidade!: number;
  saldoPosTransacao!: number;
  observacao?: string | null;
  responsavel!: string;
}

export class EstoqueHistoryResponseDto {
  bookId!: number;
  items!: EstoqueHistoryEntryDto[];
}
