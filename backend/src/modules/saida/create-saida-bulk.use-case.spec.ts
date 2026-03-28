import { Test, TestingModule } from '@nestjs/testing';
import { CreateSaidaBulkUseCase } from './create-saida-bulk.use-case';
import { PrismaService } from '../database/prisma.service';
import { CreateSaidaBulkDto } from './create-saida-bulk.dto';
import { Prisma } from '@prisma/client';

describe('CreateSaidaBulkUseCase', () => {
  let useCase: CreateSaidaBulkUseCase;

  const mockPrisma = {
    $transaction: jest.fn(),
    book: { findUnique: jest.fn() },
    tipoSaida: { findUnique: jest.fn() },
    estoque: { findUnique: jest.fn(), update: jest.fn() },
    canalVenda: { findUnique: jest.fn() },
    formaPagamento: { findUnique: jest.fn() },
    saida: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSaidaBulkUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<CreateSaidaBulkUseCase>(CreateSaidaBulkUseCase);
    jest.clearAllMocks();
  });

  it('should process bulk items successfully', async () => {
    const dto: CreateSaidaBulkDto = {
      items: [
        {
          bookId: 1,
          usuarioId: 'user-uuid',
          tipoSaidaId: 1,
          dataSaida: new Date().toISOString(),
          quantidade: 1,
          valorUnitario: 0,
        },
      ],
    };

    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
        await cb(mockPrisma),
    );
    mockPrisma.book.findUnique.mockResolvedValue({
      id: 1,
      title: 'Book 1',
      isActive: true,
    });
    mockPrisma.tipoSaida.findUnique.mockResolvedValue({
      id: 1,
      isVenda: false,
    });
    mockPrisma.estoque.findUnique.mockResolvedValue({
      bookId: 1,
      quantidade: 10,
      custoMedio: new Prisma.Decimal(10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.saida.create.mockResolvedValue({ id: 1 });

    const result = await useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(mockPrisma.saida.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.estoque.update).toHaveBeenCalledTimes(1);
  });

  it('should fail and rollback if any item has insufficient stock', async () => {
    const dto: CreateSaidaBulkDto = {
      items: [
        {
          bookId: 1,
          usuarioId: 'user-uuid',
          tipoSaidaId: 1,
          dataSaida: new Date().toISOString(),
          quantidade: 100, // More than stock
          valorUnitario: 0,
        },
      ],
    };

    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
        await cb(mockPrisma),
    );
    mockPrisma.book.findUnique.mockResolvedValue({
      id: 1,
      title: 'Book 1',
      isActive: true,
    });
    mockPrisma.tipoSaida.findUnique.mockResolvedValue({
      id: 1,
      isVenda: false,
    });
    mockPrisma.estoque.findUnique.mockResolvedValue({
      bookId: 1,
      quantidade: 10,
      custoMedio: new Prisma.Decimal(10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ESTOQUE_INSUFICIENTE');
  });
});
