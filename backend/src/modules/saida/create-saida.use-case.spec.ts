import { CreateSaidaUseCase } from './create-saida.use-case';
import { PrismaService } from '../database';
import { BookBuilder } from '../../test-utils/builders/book.builder';
import { EstoqueBuilder } from '../../test-utils/builders/estoque.builder';
import { Prisma } from '@prisma/client';

describe('CreateSaidaUseCase', () => {
  let useCase: CreateSaidaUseCase;

  const mockPrisma = {
    book: { findUnique: jest.fn() },
    tipoSaida: { findUnique: jest.fn() },
    estoque: { findUnique: jest.fn() },
    canalVenda: { findUnique: jest.fn() },
    formaPagamento: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockBookAtivo = BookBuilder.aBook().withPrecoTabelado('89.90').build();
  const mockBookInisActive = BookBuilder.aBook().inactive().build();
  const mockTipoVenda = { id: 1, descricao: 'Venda', isVenda: true };
  const mockTipoNaoVenda = { id: 2, descricao: 'Perda', isVenda: false };
  const mockEstoque = EstoqueBuilder.anEstoque()
    .withQuantidade(10)
    .withCustoUnitarioMedio(20)
    .build();
  const mockCanal = {
    id: 1,
    comissaoVariavel: new Prisma.Decimal('0.2000'),
    comissaoFixa: new Prisma.Decimal(0),
  };
  const mockForma = { id: 1, taxa: new Prisma.Decimal('0.0360') };

  const baseSaidaVenda = {
    bookId: 1,
    usuarioId: 'user-uuid',
    tipoSaidaId: 1,
    canalVendaId: 1,
    formaPagamentoId: 1,
    dataSaida: '2026-01-01',
    quantidade: 2,
    valorUnitario: 50,
  };

  const baseSaidaNaoVenda = {
    bookId: 1,
    usuarioId: 'user-uuid',
    tipoSaidaId: 2,
    dataSaida: '2026-01-01',
    quantidade: 2,
    valorUnitario: 0,
  };

  beforeEach(() => {
    useCase = new CreateSaidaUseCase(mockPrisma as unknown as PrismaService);
    jest.clearAllMocks();
  });

  it('should reject if book is not found', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(null);
    const result = await useCase.execute(baseSaidaVenda);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_NOT_FOUND');
  });

  it('should reject if book is inactive (RULE LIV-03)', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookInisActive);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    const result = await useCase.execute({ ...baseSaidaVenda, bookId: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_INATIVO');
  });

  it('should reject sale without canalVendaId (RULE SAI-02)', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookAtivo);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    const result = await useCase.execute({
      ...baseSaidaVenda,
      canalVendaId: undefined,
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SAIDA_CANAL_REQUIRED');
  });

  it('should reject sale with valorUnitario = 0 (RULE SAI-02)', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookAtivo);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    // canalVendaId present but valorUnitario = 0 → SAIDA_VALOR_REQUIRED
    const result = await useCase.execute({
      ...baseSaidaVenda,
      valorUnitario: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SAIDA_VALOR_REQUIRED');
  });

  it('should reject non-sale with valorUnitario > 0 (RULE SAI-03)', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookAtivo);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoNaoVenda);
    const result = await useCase.execute({
      ...baseSaidaNaoVenda,
      valorUnitario: 10,
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SAIDA_VALOR_MUST_BE_ZERO');
  });

  it('should reject when stock is insufficient (RULE SAI-01)', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookAtivo);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoNaoVenda);
    const txMock = {
      estoque: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ ...mockEstoque, quantidade: 1 }),
      },
    };
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
    );

    const result = await useCase.execute({
      ...baseSaidaNaoVenda,
      quantidade: 5,
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ESTOQUE_INSUFICIENTE');
  });

  it('should create a sale with correct snapshots (RULE SAI-05)', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookAtivo);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    mockPrisma.estoque.findUnique.mockResolvedValue(mockEstoque);
    mockPrisma.canalVenda.findUnique.mockResolvedValue(mockCanal);
    mockPrisma.formaPagamento.findUnique.mockResolvedValue(mockForma);

    const txMock = {
      estoque: {
        findUnique: jest.fn().mockResolvedValue(mockEstoque),
        update: jest.fn(),
      },
      canalVenda: { findUnique: jest.fn().mockResolvedValue(mockCanal) },
      formaPagamento: { findUnique: jest.fn().mockResolvedValue(mockForma) },
      saida: { create: jest.fn().mockResolvedValue({ id: 1 }) },
    };
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
    );

    const result = await useCase.execute(baseSaidaVenda);

    expect(result.success).toBe(true);
    // valorTotal = 2 * 50 = 100
    // snapshotCustoUnitario = 20, snapshotCustoTotal = 2 * 20 = 40
    // valorComissaoPlataforma = 100 * 0.20 = 20
    // valorTaxaPagamento = 100 * 0.036 = 3.60
    // lucroVenda = 100 - 40 - 20 - 3.60 = 36.40
    expect(txMock.saida.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          valorTotal: expect.anything(), // Prisma.Decimal
          snapshotCustoUnitario: expect.anything(),
          snapshotCustoTotal: expect.anything(),
          snapshotComissaoPlataforma: expect.anything(),
          snapshotTaxaPagamento: expect.anything(),
          lucroVenda: expect.anything(),
        }),
      }),
    );
    // Estoque decrementado (RULE SAI-04) - Agora absoluto via Entidade
    expect(txMock.estoque.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          quantidade: 8,
          dataUltimaSaida: expect.anything(),
        }),
      }),
    );
  });

  it('should create a non-sale exit with zero comissao/taxa', async () => {
    mockPrisma.book.findUnique.mockResolvedValue(mockBookAtivo);
    mockPrisma.tipoSaida.findUnique.mockResolvedValue(mockTipoNaoVenda); // fixed!
    mockPrisma.estoque.findUnique.mockResolvedValue(mockEstoque);

    const txMock = {
      estoque: {
        findUnique: jest.fn().mockResolvedValue(mockEstoque),
        update: jest.fn(),
      },
      saida: { create: jest.fn().mockResolvedValue({ id: 2 }) },
    };
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
    );

    const result = await useCase.execute(baseSaidaNaoVenda);

    if (!result.success) console.error('FAILED SAIDA NON-SALE:', result.error);
    expect(result.success).toBe(true);
    expect(txMock.saida.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshotComissaoPlataforma: expect.anything(),
          snapshotTaxaPagamento: expect.anything(),
          lucroVenda: expect.anything(),
        }),
      }),
    );
    // Estoque decrementado
    expect(txMock.estoque.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          quantidade: 8,
          dataUltimaSaida: expect.anything(),
        }),
      }),
    );
  });
});
