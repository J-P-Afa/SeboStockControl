import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import {
  CreateBookUseCase,
  UpdateBookUseCase,
  DeleteBookUseCase,
  GetBookUseCase,
  ListBooksUseCase,
  GetBookByIsbnUseCase,
  LookupExternalBookUseCase,
} from '../application/use-cases';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { Result } from '../../../common';
import { Condition, EditionType, Status } from '@prisma/client';
import {
  BookResponseDto,
  CreateBookDto,
  UpdateBookDto,
} from '../application/dtos';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';

describe('BookController', () => {
  let controller: BookController;
  let createBookUseCase: MockProxy<CreateBookUseCase>;
  let updateBookUseCase: MockProxy<UpdateBookUseCase>;
  let deleteBookUseCase: MockProxy<DeleteBookUseCase>;
  let getBookUseCase: MockProxy<GetBookUseCase>;
  let listBooksUseCase: MockProxy<ListBooksUseCase>;
  let getBookByIsbnUseCase: MockProxy<GetBookByIsbnUseCase>;
  let lookupExternalBookUseCase: MockProxy<LookupExternalBookUseCase>;

  const mockBookDto = {
    id: 1,
    title: 'Dom Quixote',
  } as BookResponseDto;

  beforeEach(async () => {
    createBookUseCase = mockDeep<CreateBookUseCase>();
    updateBookUseCase = mockDeep<UpdateBookUseCase>();
    deleteBookUseCase = mockDeep<DeleteBookUseCase>();
    getBookUseCase = mockDeep<GetBookUseCase>();
    listBooksUseCase = mockDeep<ListBooksUseCase>();
    getBookByIsbnUseCase = mockDeep<GetBookByIsbnUseCase>();
    lookupExternalBookUseCase = mockDeep<LookupExternalBookUseCase>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        { provide: CreateBookUseCase, useValue: createBookUseCase },
        { provide: UpdateBookUseCase, useValue: updateBookUseCase },
        { provide: DeleteBookUseCase, useValue: deleteBookUseCase },
        { provide: GetBookUseCase, useValue: getBookUseCase },
        { provide: ListBooksUseCase, useValue: listBooksUseCase },
        { provide: GetBookByIsbnUseCase, useValue: getBookByIsbnUseCase },
        {
          provide: LookupExternalBookUseCase,
          useValue: lookupExternalBookUseCase,
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
  });

  describe('create', () => {
    it('should format successful creation as { success, data }', async () => {
      const dto = new CreateBookDto();
      dto.title = 'New Book';
      dto.editionType = EditionType.normal;
      dto.condition = Condition.novo;
      dto.status = Status.completo;
      dto.weight = 0.5;

      createBookUseCase.execute.mockResolvedValue(Result.ok(mockBookDto));

      const response = await controller.create(dto);

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
      expect(createBookUseCase.execute).toHaveBeenCalledWith(dto);
    });

    it('should return Result.fail on ISBN collision', async () => {
      const dto: CreateBookDto = {
        title: 'New Book',
        editionType: EditionType.normal,
        condition: Condition.novo,
        status: Status.completo,
        weight: 0.5,
      };
      createBookUseCase.execute.mockResolvedValue(
        Result.fail('ISBN13_ALREADY_EXISTS', 'ISBN already exists'),
      );

      const response = await controller.create(dto);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('ISBN13_ALREADY_EXISTS');
    });

    it('should return Result.fail on other failures', async () => {
      const dto: CreateBookDto = {
        title: 'New Book',
        editionType: EditionType.normal,
        condition: Condition.novo,
        status: Status.completo,
        weight: 0.5,
      };
      createBookUseCase.execute.mockResolvedValue(Result.fail('ERR', 'Fail'));

      const response = await controller.create(dto);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('ERR');
    });
  });

  describe('externalLookup', () => {
    it('should format successful external lookup as { success, data }', async () => {
      lookupExternalBookUseCase.execute.mockResolvedValue(
        Result.ok(mockBookDto as unknown as ExternalBookLookupDto),
      );

      const response = await controller.externalLookup('123');

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
    });

    it('should return Result.fail on failed lookup', async () => {
      lookupExternalBookUseCase.execute.mockResolvedValue(
        Result.fail('NF', 'Not Found'),
      );

      const response = await controller.externalLookup('123');
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NF');
    });
  });

  describe('findAll', () => {
    it('should parse query parameters correctly and delegate to UseCase', async () => {
      listBooksUseCase.execute.mockResolvedValue(Result.ok([mockBookDto]));

      const response = await controller.findAll(
        '1', // id
        'isbn123', // isbn
        'quixote', // search
        '2', // classificacaoId
        '3', // publisherId
        '4', // languageId
        Condition.novo, // condition
        'true', // isActive
        EditionType.normal, // editionType
        Status.completo, // status
        '1', // volume
        'Col', // collection
        'false', // inStock
      );

      expect(response).toStrictEqual({ success: true, data: [mockBookDto] });
      expect(listBooksUseCase.execute).toHaveBeenCalledWith({
        id: 1,
        isbn: 'isbn123',
        search: 'quixote',
        classificacaoId: 2,
        publisherId: 3,
        languageId: 4,
        condition: Condition.novo,
        isActive: true,
        editionType: EditionType.normal,
        status: Status.completo,
        volume: '1',
        collection: 'Col',
        inStock: false,
      });
    });
  });

  describe('getByIsbn', () => {
    it('should use GetBookByIsbnUseCase if no condition is provided', async () => {
      getBookByIsbnUseCase.execute.mockResolvedValue(Result.ok(mockBookDto));

      const response = await controller.getByIsbn('123');

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
      expect(getBookByIsbnUseCase.execute).toHaveBeenCalledWith('123');
    });

    it('should use ListBooksUseCase if condition is provided and return first result', async () => {
      listBooksUseCase.execute.mockResolvedValue(Result.ok([mockBookDto]));

      const response = await controller.getByIsbn('123', Condition.usado);

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
      expect(listBooksUseCase.execute).toHaveBeenCalledWith({
        isbn: '123',
        condition: Condition.usado,
      });
    });

    it('should return Result.fail if condition is provided but no books found', async () => {
      listBooksUseCase.execute.mockResolvedValue(Result.ok([]));

      const response = await controller.getByIsbn('123', Condition.usado);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('BOOK_NOT_FOUND');
    });
  });

  describe('findOne', () => {
    it('should return book if found', async () => {
      getBookUseCase.execute.mockResolvedValue(Result.ok(mockBookDto));

      const response = await controller.findOne(1);

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
    });

    it('should return Result.fail if book not found', async () => {
      getBookUseCase.execute.mockResolvedValue(Result.fail('NF', 'Not found'));

      const response = await controller.findOne(1);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NF');
    });
  });

  describe('update', () => {
    it('should format successful update as { success, data }', async () => {
      const dto: UpdateBookDto = { title: 'Updated' };
      updateBookUseCase.execute.mockResolvedValue(Result.ok(mockBookDto));

      const response = await controller.update(1, dto);

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
    });

    it('should return Result.fail when book not found', async () => {
      updateBookUseCase.execute.mockResolvedValue(
        Result.fail('BOOK_NOT_FOUND', 'Not found'),
      );

      const response = await controller.update(1, {} as UpdateBookDto);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('BOOK_NOT_FOUND');
    });

    it('should return Result.fail on failed update', async () => {
      updateBookUseCase.execute.mockResolvedValue(
        Result.fail('BA', 'Bad request'),
      );

      const response = await controller.update(1, {} as UpdateBookDto);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('BA');
    });
  });

  describe('remove', () => {
    it('should return Result.ok on success', async () => {
      deleteBookUseCase.execute.mockResolvedValue(Result.ok());

      const response = await controller.remove(1);
      expect(response).toStrictEqual({ success: true, data: undefined });
    });

    it('should return Result.fail if delete fails', async () => {
      deleteBookUseCase.execute.mockResolvedValue(
        Result.fail('NF', 'Id not found'),
      );

      const response = await controller.remove(1);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NF');
    });
  });
});
