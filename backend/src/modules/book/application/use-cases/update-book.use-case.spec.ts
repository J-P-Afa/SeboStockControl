import { Test, TestingModule } from '@nestjs/testing';
import { Condition, EditionType, Prisma, Status } from '@prisma/client';
import { UpdateBookUseCase } from './update-book.use-case';
import {
  BOOK_REPOSITORY,
  IBookRepository,
} from '../../domain/book.repository.interface';
import { BookEntity, BookProps } from '../../domain/book.entity';

describe('UpdateBookUseCase', () => {
  let useCase: UpdateBookUseCase;
  let bookRepository: jest.Mocked<IBookRepository>;

  const existingBookProps: BookProps = {
    id: 6,
    title: 'A menina do outro lado',
    subtitle: null,
    isbn13: '9788594541611',
    isbn10: '8594541619',
    listPrice: new Prisma.Decimal('39.90'),
    editionType: EditionType.normal,
    volume: '',
    collection: null,
    condition: Condition.usado,
    status: Status.completo,
    publicationYear: null,
    pages: null,
    synopsis: '',
    dimensions: '',
    weight: new Prisma.Decimal('500'),
    publisherId: 9,
    languageId: 1,
    genreId: 6,
    classificacaoId: null,
    isActive: true,
    createdAt: new Date('2026-04-28T23:05:36.855Z'),
    updatedAt: new Date('2026-04-28T23:40:03.021Z'),
    stock: 0,
  };

  beforeEach(async () => {
    bookRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByIsbn: jest.fn(),
      findByIsbn13AndCondition: jest.fn(),
      findByIsbn10AndCondition: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBookUseCase,
        { provide: BOOK_REPOSITORY, useValue: bookRepository },
      ],
    }).compile();

    useCase = module.get<UpdateBookUseCase>(UpdateBookUseCase);
  });

  it('should pass only mutable book fields to repository update', async () => {
    const updatedTitle = 'A menina do outro lado: volume 2';

    bookRepository.findById.mockResolvedValue(
      BookEntity.restore(existingBookProps),
    );
    bookRepository.update.mockImplementation((_id, data) =>
      Promise.resolve(
        BookEntity.restore({
          ...existingBookProps,
          ...data,
          updatedAt: new Date('2026-04-28T23:45:00.000Z'),
        }),
      ),
    );

    const result = await useCase.execute(6, { title: updatedTitle });

    expect(result.success).toBe(true);
    expect(bookRepository.update).toHaveBeenCalledTimes(1);

    const [, updatePayload] = bookRepository.update.mock.calls[0];
    expect(updatePayload).toMatchObject({ title: updatedTitle });
    expect(updatePayload).not.toHaveProperty('id');
    expect(updatePayload).not.toHaveProperty('createdAt');
    expect(updatePayload).not.toHaveProperty('updatedAt');
    expect(updatePayload).not.toHaveProperty('stock');
  });
});
