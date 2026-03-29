import { PrismaService } from '../../database/prisma.service';
import { GetRecentTransactionsUseCase } from './get-recent-transactions.use-case';
import { Test, TestingModule } from '@nestjs/testing';

describe('GetRecentTransactionsUseCase', () => {
  let useCase: GetRecentTransactionsUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecentTransactionsUseCase,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetRecentTransactionsUseCase>(
      GetRecentTransactionsUseCase,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return recent transactions correctly', async () => {
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
      {
        id: 1,
        book_name: 'Duna',
        date: '2026-03-25',
        valor_total: 100.0,
        profit: 40.0,
      },
    ]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      {
        id: 1,
        bookName: 'Duna',
        date: '2026-03-25',
        totalValue: 100.0,
        profit: 40.0,
      },
    ]);
  });
});
