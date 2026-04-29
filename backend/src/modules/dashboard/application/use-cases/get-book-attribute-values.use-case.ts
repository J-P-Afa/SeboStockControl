import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import type { DashboardRepository } from '../../domain/dashboard.repository';
import {
  DashboardBookAttribute,
  DashboardBookAttributeValue,
} from '../../domain/dashboard.repository';

@Injectable()
export class GetBookAttributeValuesUseCase {
  private readonly logger = new Logger(GetBookAttributeValuesUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(
    attribute: DashboardBookAttribute,
  ): Promise<Result<DashboardBookAttributeValue[]>> {
    try {
      const values = await this.repository.getBookAttributeValues(attribute);
      return Result.ok(values);
    } catch (error) {
      this.logger.error('Failed to retrieve book attribute values', error);
      return Result.fail(
        'GET_BOOK_ATTRIBUTE_VALUES_ERROR',
        'Falha ao recuperar valores para o filtro de livros.',
      );
    }
  }
}
