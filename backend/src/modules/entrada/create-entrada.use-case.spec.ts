import { CreateEntradaUseCase } from './create-entrada.use-case';
import { PrismaService } from '../database';
import { LivroBuilder } from '../../test-utils/builders/livro.builder';
import { EstoqueBuilder } from '../../test-utils/builders/estoque.builder';

describe('CreateEntradaUseCase', () => {
  let useCase: CreateEntradaUseCase;
  let prismaMock: any;

  const mockLivroAtivo = LivroBuilder.aLivro().build();
  const mockLivroInativo = LivroBuilder.aLivro().inactive().build();

  const mockEstoqueVazio = EstoqueBuilder.anEstoque().empty().build();
  const mockEstoqueComSaldo = EstoqueBuilder.anEstoque().withQuantidade(10).withCustoUnitarioMedio(20).build();

  const baseDto = {
    livroId: 1,
    usuarioId: 'user-uuid',
    data: '2026-01-01',
    quantidade: 5,
    valorUnitario: 30,
  };

  beforeEach(() => {
    prismaMock = {
      livro: { findUnique: jest.fn().mockResolvedValue(mockLivroAtivo) },
      $transaction: jest.fn(),
    };
    useCase = new CreateEntradaUseCase(prismaMock as unknown as PrismaService);
    jest.clearAllMocks();
  });

  it('should reject if livro is not found', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(null);

    const result = await useCase.execute(baseDto);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_NOT_FOUND');
  });

  it('should reject if livro is inactive (RULE LIV-03)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroInativo);

    const result = await useCase.execute({ ...baseDto, livroId: 2 });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_INATIVO');
  });

  it('should apply WACC correctly on first purchase (estoque zerado)', async () => {
    const txMock = {
      estoque: {
        findUnique: jest.fn().mockResolvedValue(mockEstoqueVazio),
        upsert: jest.fn(),
      },
      entrada: { create: jest.fn().mockResolvedValue({ id: 1 }) },
    };
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));

    const result = await useCase.execute(baseDto);

    expect(result.success).toBe(true);
    // WACC: (0 * 0 + 5 * 30) / (0 + 5) = 30
    expect(txMock.estoque.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          quantidade: 5,
          custoUnitarioMedio: 30,
        }),
      }),
    );
  });

  it('should apply WACC correctly when there is existing stock', async () => {
    const txMock = {
      estoque: {
        findUnique: jest.fn().mockResolvedValue(mockEstoqueComSaldo),
        upsert: jest.fn(),
      },
      entrada: { create: jest.fn().mockResolvedValue({ id: 2 }) },
    };
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));

    const result = await useCase.execute(baseDto); // 5 unidades a R$30

    expect(result.success).toBe(true);
    // WACC: (10 * 20 + 5 * 30) / (10 + 5) = (200 + 150) / 15 = 350/15 ≈ 23.3333
    expect(txMock.estoque.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          quantidade: 15,
          custoUnitarioMedio: expect.closeTo(23.3333, 2),
        }),
      }),
    );
  });

  it('should NOT change custo_unitario_medio on donation (valorUnitario = 0)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    const txMock = {
      estoque: {
        findUnique: jest.fn().mockResolvedValue(mockEstoqueComSaldo),
        upsert: jest.fn(),
      },
      entrada: { create: jest.fn().mockResolvedValue({ id: 3 }) },
    };
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));

    const result = await useCase.execute({ ...baseDto, valorUnitario: 0 });

    expect(result.success).toBe(true);
    // Doação: custo médio DEVE ser mantido em 20
    expect(txMock.estoque.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          quantidade: 15,
          custoUnitarioMedio: 20, // mantido!
        }),
      }),
    );
  });
});
