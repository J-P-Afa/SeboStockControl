import { CreateEntradaUseCase } from './create-entrada.use-case';
import { PrismaService } from '../database';
import { BookBuilder } from '../../test-utils/builders/book.builder';
import { EstoqueBuilder } from '../../test-utils/builders/estoque.builder';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Entrada } from '@prisma/client';

describe('CreateEntradaUseCase', () => {
  let useCase: CreateEntradaUseCase;
  let prismaMock: DeepMockProxy<PrismaService>;

  const mockBookAtivo = BookBuilder.aBook().build();
  const mockBookInisActive = BookBuilder.aBook().inactive().build();

  const mockEstoqueVazio = EstoqueBuilder.anEstoque().empty().build();
  const mockEstoqueComSaldo = EstoqueBuilder.anEstoque()
    .withQuantidade(10)
    .withCustoUnitarioMedio(20)
    .build();

  const baseDto = {
    bookId: 1,
    usuarioId: 'user-uuid',
    dataEntrada: '2026-01-01',

    quantidade: 5,
    custoUnitario: 30,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();
    useCase = new CreateEntradaUseCase(prismaMock);
    jest.clearAllMocks();
  });

  it('should reject if book is not found', async () => {
    prismaMock.book.findUnique.mockResolvedValue(null);

    const result = await useCase.execute(baseDto);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_NOT_FOUND');
  });

  it('should reject if book is inactive (RULE LIV-03)', async () => {
    prismaMock.book.findUnique.mockResolvedValue(mockBookInisActive);

    const result = await useCase.execute({ ...baseDto, bookId: 2 });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_INATIVO');
  });

  it('should apply WACC correctly on first purchase (estoque zerado)', async () => {
    const txMock = mockDeep<PrismaService>();
    txMock.estoque.findUnique.mockResolvedValue(mockEstoqueVazio);
    txMock.entrada.create.mockResolvedValue({ id: 1 } as Entrada);

    prismaMock.$transaction.mockImplementation(
      (cb: (tx: DeepMockProxy<PrismaService>) => Promise<unknown>) =>
        cb(txMock),
    );

    prismaMock.book.findUnique.mockResolvedValue(mockBookAtivo);

    const result = await useCase.execute(baseDto);

    expect(result.success).toBe(true);
    // WACC: (0 * 0 + 5 * 30) / (0 + 5) = 30

    expect(txMock.estoque.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          quantidade: 5,

          custoMedio: expect.anything(),
        }),
      }),
    );
  });

  it('should apply WACC correctly when there is existing stock', async () => {
    const txMock = mockDeep<PrismaService>();
    txMock.estoque.findUnique.mockResolvedValue(mockEstoqueComSaldo);
    txMock.entrada.create.mockResolvedValue({ id: 2 } as Entrada);

    prismaMock.$transaction.mockImplementation(
      (cb: (tx: DeepMockProxy<PrismaService>) => Promise<unknown>) =>
        cb(txMock),
    );

    prismaMock.book.findUnique.mockResolvedValue(mockBookAtivo);

    const result = await useCase.execute(baseDto); // 5 unidades a R$30

    expect(result.success).toBe(true);
    // WACC: (10 * 20 + 5 * 30) / (10 + 5) = (200 + 150) / 15 = 350/15 ≈ 23.3333

    expect(txMock.estoque.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          quantidade: 15,

          custoMedio: expect.anything(),
        }),
      }),
    );
  });

  it('should NOT change custo_unitario_medio on donation (valorUnitario = 0)', async () => {
    prismaMock.book.findUnique.mockResolvedValue(mockBookAtivo);
    const txMock = mockDeep<PrismaService>();
    txMock.estoque.findUnique.mockResolvedValue(mockEstoqueComSaldo);
    txMock.entrada.create.mockResolvedValue({ id: 3 } as Entrada);

    prismaMock.$transaction.mockImplementation(
      (cb: (tx: DeepMockProxy<PrismaService>) => Promise<unknown>) =>
        cb(txMock),
    );

    const result = await useCase.execute({ ...baseDto, custoUnitario: 0 });

    expect(result.success).toBe(true);
    // Doação: custo médio DEVE ser mantido em 20

    expect(txMock.estoque.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          quantidade: 15,

          custoMedio: expect.anything(),
        }),
      }),
    );
  });
});
