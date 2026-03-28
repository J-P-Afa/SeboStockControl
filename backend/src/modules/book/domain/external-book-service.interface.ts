import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';

export const EXTERNAL_BOOK_SERVICE = Symbol('EXTERNAL_BOOK_SERVICE');

export interface IExternalBookService {
  /**
   * Busca informações de um livro em APIs externas pelo ISBN.
   * @param isbn ISBN-10 ou ISBN-13.
   */
  lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null>;
}
