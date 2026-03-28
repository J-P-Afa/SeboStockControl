import { PrismaService } from '../../database/prisma.service';
import { GetTopCategoriesUseCase } from './get-top-categories.use-case';
import { Test, TestingModule } from '@nestjs/testing';

describe('GetTopCategoriesUseCase', () => {
  let useCase: GetTopCategoriesUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTopCategoriesUseCase,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetTopCategoriesUseCase>(GetTopCategoriesUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return top categories aggregated by profit and sales', async () => {
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
      { category: 'Ficção Científica', total_vendas: 1200.0, lucro_liquido: 500.0 },
      { category: 'Terror', total_vendas: 800.0, lucro_liquido: 300.0 },
    ]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { category: 'Ficção Científica', totalSales: 1200.0, netProfit: 500.0 },
      { category: 'Terror', totalSales: 800.0, netProfit: 300.0 },
    ]);
  });
});
