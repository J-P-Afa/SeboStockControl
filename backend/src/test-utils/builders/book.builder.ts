import { Book, EditionType, Condition, Status } from '@prisma/client';
import { Decimal } from '../decimal';

export class BookBuilder {
  private props: Partial<Book> = {
    id: 1,
    title: 'Book de Teste',
    classificacaoId: 1,
    publisherId: 1,
    languageId: 1,
    genreId: 1,
    editionType: EditionType.normal,
    condition: Condition.novo,
    status: Status.completo,
    isActive: true,
    listPrice: new Decimal('100.00'),
    weight: new Decimal('500.00'),
  };

  static aBook(): BookBuilder {
    return new BookBuilder();
  }

  withId(id: number): this {
    this.props.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.props.title = title;
    return this;
  }

  inactive(): this {
    this.props.isActive = false;
    return this;
  }

  withListPrice(price: string | number): this {
    this.props.listPrice = new Decimal(price);
    return this;
  }

  withPrecoTabelado(price: string | number): this {
    return this.withListPrice(price);
  }


  build(): Book {
    return this.props as Book;
  }
}
