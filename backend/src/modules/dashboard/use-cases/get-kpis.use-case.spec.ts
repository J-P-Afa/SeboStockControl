import { PrismaService } from '../../database/prisma.service';
import { GetKPIsUseCase } from './get-kpis.use-case';
import { Test, TestingModule } from '@nestjs/testing';

describe('GetKPIsUseCase', () => {
  let useCase: GetKPIsUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetKPIsUseCase,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetKPIsUseCase>(GetKPIsUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should calculate KPIs correctly when there are sales', async () => {
    // Arrange: Mock the query return
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
      {
        total_vendas: 500.0,
        lucro_liquido: 200.0,
        margem_lucro: 40.0,
        ticket_medio: 50.0,
      },
    ]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toEqual({
      totalVendas: 500.0,
      lucroLiquido: 200.0,
      margemLucro: 40.0,
      ticketMedio: 50.0,
    });
    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return zeros when there are no sales', async () => {
    // Arrange: Mock the query return for 0 sales
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([
      {
        total_vendas: null,
        lucro_liquido: null,
        margem_lucro: null,
        ticket_medio: null,
      },
    ]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      totalVendas: 0,
      lucroLiquido: 0,
      margemLucro: 0,
      ticketMedio: 0,
    });
  });

  it('should return a failed Result Pattern if database query throws', async () => {
    // Arrange
    jest
      .spyOn(prismaService, '$queryRaw')
      .mockRejectedValue(new Error('DB connection failed'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('GET_KPIS_ERROR');
  });
});
