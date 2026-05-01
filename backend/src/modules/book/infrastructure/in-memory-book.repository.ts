import {
  IBookRepository,
  CreateBookParams,
  UpdateBookParams,
  BookFilters,
} from '../domain/book.repository.interface';
import { BookEntity, BookProps } from '../domain/book.entity';
import { Condition } from '@prisma/client';

type SortableValue = string | number | boolean;
type DecimalLike = { toNumber: () => number };

function hasToNumber(value: unknown): value is DecimalLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof value.toNumber === 'function'
  );
}

function normalizeSortableValue(value: unknown): SortableValue {
  if (value instanceof Date) return value.getTime();
  if (hasToNumber(value)) return value.toNumber();
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  return String(value);
}

export class InMemoryBookRepository implements IBookRepository {
  public items: BookEntity[] = [];
  private autoIncrementId = 1;

  findById(id: number): Promise<BookEntity | null> {
    const book = this.items.find((item) => item.id === id);
    if (!book) return Promise.resolve(null);
    return Promise.resolve(BookEntity.restore(book.toJSON())); // Return copy to prevent mutation
  }

  findAll(
    filters?: BookFilters,
  ): Promise<{ items: BookEntity[]; total: number }> {
    let result = [...this.items];

    if (filters) {
      if (filters.id) {
        result = result.filter((item) => item.id === filters.id);
      }
      if (filters.isbn) {
        result = result.filter(
          (item) =>
            item.isbn13 === filters.isbn || item.isbn10 === filters.isbn,
        );
      }
      if (filters.search) {
        const lowerSearch = filters.search.toLowerCase();
        result = result.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerSearch) ||
            item.subtitle?.toLowerCase().includes(lowerSearch),
        );
      }
      if (filters.classificacaoId) {
        result = result.filter(
          (item) => item.classificacaoId === filters.classificacaoId,
        );
      }
      if (filters.publisherId) {
        result = result.filter(
          (item) => item.publisherId === filters.publisherId,
        );
      }
      if (filters.languageId) {
        result = result.filter(
          (item) => item.languageId === filters.languageId,
        );
      }
      if (filters.genreId) {
        result = result.filter((item) => item.genreId === filters.genreId);
      }
      if (filters.editionType) {
        result = result.filter(
          (item) => item.editionType === filters.editionType,
        );
      }
      if (filters.volume) {
        result = result.filter((item) => item.volume === filters.volume);
      }
      if (filters.collection) {
        result = result.filter(
          (item) => item.collection === filters.collection,
        );
      }
      if (filters.condition) {
        result = result.filter((item) => item.condition === filters.condition);
      }
      if (filters.status) {
        result = result.filter((item) => item.status === filters.status);
      }
      if (filters.isActive !== undefined) {
        result = result.filter((item) => item.isActive === filters.isActive);
      }
      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          result = result.filter((item) => (item.stock || 0) > 0);
        } else {
          result = result.filter((item) => (item.stock || 0) === 0);
        }
      }
    }

    const total = result.length;

    if (filters?.sortBy) {
      const field = filters.sortBy as keyof BookEntity;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const normA = normalizeSortableValue(valA);
        const normB = normalizeSortableValue(valB);

        if (normA < normB) return -1 * order;
        if (normA > normB) return 1 * order;
        return 0;
      });
    }

    if (filters?.page && filters?.limit) {
      const skip = (filters.page - 1) * filters.limit;
      result = result.slice(skip, skip + filters.limit);
    }

    return Promise.resolve({
      items: result.map((b) => BookEntity.restore(b.toJSON())),
      total,
    });
  }

  findByIsbn(isbn: string): Promise<BookEntity | null> {
    const book = this.items.find(
      (item) => item.isbn13 === isbn || item.isbn10 === isbn,
    );
    if (!book) return Promise.resolve(null);
    return Promise.resolve(BookEntity.restore(book.toJSON()));
  }

  findByIsbn13AndCondition(
    isbn13: string,
    condition: Condition,
  ): Promise<BookEntity | null> {
    const book = this.items.find(
      (item) => item.isbn13 === isbn13 && item.condition === condition,
    );
    if (!book) return Promise.resolve(null);
    return Promise.resolve(BookEntity.restore(book.toJSON()));
  }

  findByIsbn10AndCondition(
    isbn10: string,
    condition: Condition,
  ): Promise<BookEntity | null> {
    const book = this.items.find(
      (item) => item.isbn10 === isbn10 && item.condition === condition,
    );
    if (!book) return Promise.resolve(null);
    return Promise.resolve(BookEntity.restore(book.toJSON()));
  }

  create(data: CreateBookParams): Promise<BookEntity> {
    const bookProps: BookProps = {
      ...data,
      id: this.autoIncrementId++,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      coverUrl: data.coverUrl ?? null,
      stock: 0,
      stockUnitCost: null,
      stockTotalCost: null,
    };
    const entity = BookEntity.restore(bookProps);
    this.items.push(entity);
    return Promise.resolve(BookEntity.restore(entity.toJSON()));
  }

  update(id: number, data: UpdateBookParams): Promise<BookEntity> {
    const bookIndex = this.items.findIndex((item) => item.id === id);
    if (bookIndex === -1) {
      return Promise.reject(new Error(`Book ${id} not found`));
    }

    const currentBook = this.items[bookIndex];
    currentBook.update(data);
    this.items[bookIndex] = currentBook;

    return Promise.resolve(BookEntity.restore(currentBook.toJSON()));
  }

  delete(id: number): Promise<void> {
    const bookIndex = this.items.findIndex((item) => item.id === id);
    if (bookIndex !== -1) {
      this.items.splice(bookIndex, 1);
    }
    return Promise.resolve();
  }
}
