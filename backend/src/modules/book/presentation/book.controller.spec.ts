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
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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

    it('should throw ConflictException on ISBN collision', async () => {
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

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on other failures', async () => {
      const dto: CreateBookDto = {
        title: 'New Book',
        editionType: EditionType.normal,
        condition: Condition.novo,
        status: Status.completo,
        weight: 0.5,
      };
      createBookUseCase.execute.mockResolvedValue(Result.fail('ERR', 'Fail'));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
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

    it('should throw NotFoundException on failed lookup', async () => {
      lookupExternalBookUseCase.execute.mockResolvedValue(
        Result.fail('NF', 'Not Found'),
      );

      await expect(controller.externalLookup('123')).rejects.toThrow(
        NotFoundException,
      );
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

    it('should throw NotFoundException if condition is provided but no books found', async () => {
      listBooksUseCase.execute.mockResolvedValue(Result.ok([]));

      await expect(
        controller.getByIsbn('123', Condition.usado),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return book if found', async () => {
      getBookUseCase.execute.mockResolvedValue(Result.ok(mockBookDto));

      const response = await controller.findOne(1);

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
    });

    it('should throw NotFoundException if book not found', async () => {
      getBookUseCase.execute.mockResolvedValue(Result.fail('NF', 'Not found'));

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should format successful update as { success, data }', async () => {
      const dto: UpdateBookDto = { title: 'Updated' };
      updateBookUseCase.execute.mockResolvedValue(Result.ok(mockBookDto));

      const response = await controller.update(1, dto);

      expect(response).toStrictEqual({ success: true, data: mockBookDto });
    });

    it('should throw NotFoundException when book not found', async () => {
      updateBookUseCase.execute.mockResolvedValue(
        Result.fail('BOOK_NOT_FOUND', 'Not found'),
      );

      await expect(controller.update(1, {} as UpdateBookDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on failed update', async () => {
      updateBookUseCase.execute.mockResolvedValue(
        Result.fail('BA', 'Bad request'),
      );

      await expect(controller.update(1, {} as UpdateBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should not throw on success (returns NO_CONTENT)', async () => {
      deleteBookUseCase.execute.mockResolvedValue(Result.ok());

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if delete fails', async () => {
      deleteBookUseCase.execute.mockResolvedValue(
        Result.fail('NF', 'Id not found'),
      );

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
