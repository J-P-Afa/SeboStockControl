import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository } from '../../domain/book.repository.interface';
import { CreateBookDto, BookResponseDto } from '../dtos';
import { EdicaoEspecial } from '../../domain/livro.entity';

/**
 * Caso de Uso: Criação de Livro
 *
 * Valida unicidade de ISBN por estado (RULE [LIV-02]) antes de persistir.
 * A criação automática do Estoque (RULE [LIV-01]) é responsabilidade do repositório.
 *
 * @ai-context Result Pattern — sem exceções para fluxos esperados.
 * @side-effects Persiste Livro e cria Estoque inicial via repositório.
 */
@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(dto: CreateBookDto): Promise<Result<BookResponseDto>> {
    // RULE [LIV-02]: unicidade ISBN por estado
    if (dto.isbn13) {
      const existing = await this.bookRepository.findByIsbn13AndEstado(dto.isbn13, dto.estado);
      if (existing) {
        return Result.fail('BOOK_ISBN13_EXISTS', `Já existe um livro ${dto.estado} com este ISBN-13`);
      }
    }
    if (dto.isbn10) {
      const existing = await this.bookRepository.findByIsbn10AndEstado(dto.isbn10, dto.estado);
      if (existing) {
        return Result.fail('BOOK_ISBN10_EXISTS', `Já existe um livro ${dto.estado} com este ISBN-10`);
      }
    }

    const livro = await this.bookRepository.create({
      ...dto,
      edicaoEspecial: dto.edicaoEspecial ?? EdicaoEspecial.NORMAL,
      ativo: true,
    });

    return Result.ok(BookResponseDto.fromEntity(livro));
  }
}
