import { BookEntity } from './book.entity';
import { Condition, Status, EditionType } from '@prisma/client';

describe('BookEntity', () => {
  const validProps = {
    title: 'Test Book',
    publisherId: 1,
    languageId: 1,
    genreId: 1,
    condition: Condition.novo,
    status: Status.completo,
    editionType: EditionType.normal,
    weight: 500 as any,
    isActive: true,
  };

  describe('create', () => {
    it('should create a book with a valid 13-digit ISBN', () => {
      const book = BookEntity.create({
        ...validProps,
        isbn13: '9788535913033',
      });
      expect(book.isbn13).toBe('9788535913033');
    });

    it('should create a book with a valid 10-digit ISBN', () => {
      const book = BookEntity.create({
        ...validProps,
        isbn10: '8535913032',
      });
      expect(book.isbn10).toBe('8535913032');
    });

    it('should create a book with empty string ISBN13', () => {
      const book = BookEntity.create({
        ...validProps,
        isbn13: '',
      });
      expect(book.isbn13).toBe('');
    });

    it('should create a book with null ISBN13', () => {
      const book = BookEntity.create({
        ...validProps,
        isbn13: null,
      });
      expect(book.isbn13).toBe(null);
    });

    it('should create a book with a valid 10-digit ISBN ending in X', () => {
      const book = BookEntity.create({
        ...validProps,
        isbn10: '853591303X',
      });
      expect(book.isbn10).toBe('853591303X');
    });

    it('should clean ISBNs with hyphens and dots', () => {
      const book = BookEntity.create({
        ...validProps,
        isbn13: '978-85.359-1303-3',
        isbn10: '85-359.1303-X',
      });
      expect(book.isbn13).toBe('9788535913033');
      expect(book.isbn10).toBe('853591303X');
    });

    it('should throw error with invalid 10-digit ISBN (wrong length)', () => {
      expect(() => {
        BookEntity.create({
          ...validProps,
          isbn10: '123',
        });
      }).toThrow('ISBN-10 deve conter exatamente 10 caracteres');
    });

    it('should throw error with invalid 10-digit ISBN (non-numeric except last)', () => {
      expect(() => {
        BookEntity.create({
          ...validProps,
          isbn10: '85359A3032',
        });
      }).toThrow('ISBN-10 deve conter exatamente 10 caracteres');
    });
  });
});
