import { CreateSaidaUseCase } from './create-saida.use-case';
import { PrismaService } from '../database';
import { LivroBuilder } from '../../test-utils/builders/livro.builder';
import { EstoqueBuilder } from '../../test-utils/builders/estoque.builder';
import { SaidaBuilder } from '../../test-utils/builders/saida.builder';

describe('CreateSaidaUseCase', () => {
  let useCase: CreateSaidaUseCase;
  let prismaMock: any;

  const mockLivroAtivo = LivroBuilder.aLivro().withPrecoTabelado('89.90').build();
  const mockLivroInativo = LivroBuilder.aLivro().inactive().build();
  const mockTipoVenda = { id: 1, descricao: 'Venda', isVenda: true };
  const mockTipoNaoVenda = { id: 2, descricao: 'Perda', isVenda: false };
  const mockEstoque = EstoqueBuilder.anEstoque().withQuantidade(10).withCustoUnitarioMedio(20).build();
  const mockCanal = { id: 1, comissao: '0.2000' };
  const mockForma = { id: 1, taxa: '0.0360' };

  const baseSaidaVenda = {
    livroId: 1, usuarioId: 'user-uuid', tipoSaidaId: 1,
    canalVendaId: 1, formaPagamentoId: 1,
    data: '2026-01-01', quantidade: 2, valorUnitario: 50,
  };

  const baseSaidaNaoVenda = {
    livroId: 1, usuarioId: 'user-uuid', tipoSaidaId: 2,
    data: '2026-01-01', quantidade: 2, valorUnitario: 0,
  };

  beforeEach(() => {
    prismaMock = {
      livro: { findUnique: jest.fn() },
      tipoSaida: { findUnique: jest.fn() },
      estoque: { findUnique: jest.fn() },
      canalVenda: { findUnique: jest.fn() },
      formaPagamento: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    useCase = new CreateSaidaUseCase(prismaMock as unknown as PrismaService);
    jest.clearAllMocks();
  });

  it('should reject if livro is not found', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(null);
    const result = await useCase.execute(baseSaidaVenda);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_NOT_FOUND');
  });

  it('should reject if livro is inactive (RULE LIV-03)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroInativo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    const result = await useCase.execute({ ...baseSaidaVenda, livroId: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('LIVRO_INATIVO');
  });

  it('should reject sale without canalVendaId (RULE SAI-02)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    const result = await useCase.execute({ ...baseSaidaVenda, canalVendaId: undefined });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SAIDA_CANAL_REQUIRED');
  });

  it('should reject sale with valorUnitario = 0 (RULE SAI-02)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    // canalVendaId present but valorUnitario = 0 → SAIDA_VALOR_REQUIRED
    const result = await useCase.execute({ ...baseSaidaVenda, valorUnitario: 0 });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SAIDA_VALOR_REQUIRED');
  });

  it('should reject non-sale with valorUnitario > 0 (RULE SAI-03)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoNaoVenda);
    const result = await useCase.execute({ ...baseSaidaNaoVenda, valorUnitario: 10 });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SAIDA_VALOR_MUST_BE_ZERO');
  });

  it('should reject when stock is insufficient (RULE SAI-01)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoNaoVenda);
    prismaMock.estoque.findUnique.mockResolvedValue({ ...mockEstoque, quantidade: 1 });
    const result = await useCase.execute({ ...baseSaidaNaoVenda, quantidade: 5 });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ESTOQUE_INSUFICIENTE');
  });

  it('should create a sale with correct snapshots (RULE SAI-05)', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoVenda);
    prismaMock.estoque.findUnique.mockResolvedValue(mockEstoque);
    prismaMock.canalVenda.findUnique.mockResolvedValue(mockCanal);
    prismaMock.formaPagamento.findUnique.mockResolvedValue(mockForma);

    const txMock = {
      estoque: { update: jest.fn() },
      saida: { create: jest.fn().mockResolvedValue({ id: 1 }) },
    };
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));

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
          valorTotal: 100, snapshotCustoUnitario: 20, snapshotCustoTotal: 40,
          snapshotComissaoPlataforma: 0.2, snapshotTaxaPagamento: 0.036,
          valorComissaoPlataforma: 20, valorTaxaPagamento: expect.closeTo(3.6, 3),
          lucroVenda: expect.closeTo(36.4, 2),
        }),
      }),
    );
    // Estoque decrementado (RULE SAI-04) - Agora absoluto via Entidade
    expect(txMock.estoque.update).toHaveBeenCalledWith(
      expect.objectContaining({ 
        data: expect.objectContaining({ 
          quantidade: 8,
          custoTotal: expect.anything() // Decimal object or string
        }) 
      }),
    );
  });

  it('should create a non-sale exit with zero comissao/taxa', async () => {
    prismaMock.livro.findUnique.mockResolvedValue(mockLivroAtivo);
    prismaMock.tipoSaida.findUnique.mockResolvedValue(mockTipoNaoVenda); // fixed!
    prismaMock.estoque.findUnique.mockResolvedValue(mockEstoque);

    const txMock = {
      estoque: { update: jest.fn() },
      saida: { create: jest.fn().mockResolvedValue({ id: 2 }) },
    };
    prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));

    const result = await useCase.execute(baseSaidaNaoVenda);

    if (!result.success) console.error('FAILED SAIDA NON-SALE:', result.error);
    expect(result.success).toBe(true);
    expect(txMock.saida.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshotComissaoPlataforma: 0,
          snapshotTaxaPagamento: 0,
          lucroVenda: expect.closeTo(-40, 2),
        }),
      }),
    );
    // Estoque decrementado
    expect(txMock.estoque.update).toHaveBeenCalledWith(
      expect.objectContaining({ 
        data: expect.objectContaining({ 
          quantidade: 8,
          custoTotal: expect.anything()
        }) 
      }),
    );
  });
});
