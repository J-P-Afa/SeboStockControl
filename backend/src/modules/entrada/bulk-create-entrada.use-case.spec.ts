import { BulkCreateEntradaUseCase } from './bulk-create-entrada.use-case';
import { PrismaService } from '../database';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('BulkCreateEntradaUseCase', () => {
  let useCase: BulkCreateEntradaUseCase;
  let prismaMock: DeepMockProxy<PrismaService>;

  const baseDto = {
    usuarioId: 'user-uuid',
    dataEntrada: '2026-01-01',
    items: [
      {
        bookId: 1,
        tipoEntradaId: 1,
        quantidade: 5,
        custoUnitario: 0,
      },
    ],
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();
    useCase = new BulkCreateEntradaUseCase(prismaMock);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should reject purchase input types with zero unit cost', async () => {
    prismaMock.$transaction.mockImplementation(((
      cb: (tx: DeepMockProxy<PrismaService>) => Promise<unknown>,
    ) => cb(prismaMock)) as never);
    prismaMock.book.findUnique.mockResolvedValue({
      id: 1,
      title: 'Book 1',
      isActive: true,
    } as never);
    prismaMock.tipoEntrada.findUnique.mockResolvedValue({
      id: 1,
      descricao: 'Compra',
      isDoacao: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(baseDto);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ENTRADA_CUSTO_REQUIRED');
    expect(prismaMock.entrada.create).not.toHaveBeenCalled();
  });
});
