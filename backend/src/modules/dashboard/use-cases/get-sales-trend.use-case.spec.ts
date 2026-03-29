import { PrismaService } from '../../database/prisma.service';
import { GetSalesTrendUseCase } from './get-sales-trend.use-case';
import { Test, TestingModule } from '@nestjs/testing';

describe('GetSalesTrendUseCase', () => {
  let useCase: GetSalesTrendUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSalesTrendUseCase,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetSalesTrendUseCase>(GetSalesTrendUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should aggregate sales by date correctly', async () => {
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
      { date: '2026-03-25', total_vendas: 150.0, lucro_liquido: 50.0 },
      { date: '2026-03-26', total_vendas: 300.0, lucro_liquido: 100.0 },
    ]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { date: '2026-03-25', totalSales: 150.0, netProfit: 50.0 },
      { date: '2026-03-26', totalSales: 300.0, netProfit: 100.0 },
    ]);
  });

  it('should return error if query fails', async () => {
    jest
      .spyOn(prismaService, '$queryRaw')
      .mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_SALES_TREND_ERROR');
  });
});
