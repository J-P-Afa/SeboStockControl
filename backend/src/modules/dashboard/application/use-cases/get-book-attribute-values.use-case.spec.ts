import { Logger } from '@nestjs/common';
import { GetBookAttributeValuesUseCase } from './get-book-attribute-values.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';

describe('GetBookAttributeValuesUseCase', () => {
  let useCase: GetBookAttributeValuesUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    useCase = new GetBookAttributeValuesUseCase(repository);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should return values for the selected book attribute', async () => {
    repository.bookAttributeValues = [
      { value: '1', label: 'Editora Alfa' },
      { value: '2', label: 'Editora Beta' },
    ];

    const result = await useCase.execute('publisherId');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { value: '1', label: 'Editora Alfa' },
      { value: '2', label: 'Editora Beta' },
    ]);
  });

  it('should pass the selected attribute to the repository', async () => {
    const getBookAttributeValuesSpy = jest.spyOn(
      repository,
      'getBookAttributeValues',
    );

    await useCase.execute('condition');

    expect(getBookAttributeValuesSpy).toHaveBeenCalledWith('condition');
  });

  it('should return error if repository fails', async () => {
    jest
      .spyOn(repository, 'getBookAttributeValues')
      .mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute('publisherId');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_BOOK_ATTRIBUTE_VALUES_ERROR');
  });
});
