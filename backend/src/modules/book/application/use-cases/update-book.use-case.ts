import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository, UpdateLivroParams } from '../../domain/book.repository.interface';
import { UpdateBookDto, BookResponseDto } from '../dtos';

/**
 * Caso de Uso: Atualização de Livro
 * @ai-context Valida existência e, se ISBN for alterado, garante unicidade por estado (RULE [LIV-02]).
 */
@Injectable()
export class UpdateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(id: number, dto: UpdateBookDto): Promise<Result<BookResponseDto>> {
    const existing = await this.bookRepository.findById(id);
    if (!existing) {
      return Result.fail('BOOK_NOT_FOUND', 'Livro não encontrado');
    }

    const targetEstado = dto.estado ?? existing.estado;

    if (dto.isbn13 !== undefined && dto.isbn13 !== null) {
      const conflict = await this.bookRepository.findByIsbn13AndEstado(dto.isbn13, targetEstado);
      if (conflict && conflict.id !== id) {
        return Result.fail('BOOK_ISBN13_EXISTS', `Já existe um livro ${targetEstado} com este ISBN-13`);
      }
    }
    if (dto.isbn10 !== undefined && dto.isbn10 !== null) {
      const conflict = await this.bookRepository.findByIsbn10AndEstado(dto.isbn10, targetEstado);
      if (conflict && conflict.id !== id) {
        return Result.fail('BOOK_ISBN10_EXISTS', `Já existe um livro ${targetEstado} com este ISBN-10`);
      }
    }

    const updated = await this.bookRepository.update(id, dto as UpdateLivroParams);
    return Result.ok(BookResponseDto.fromEntity(updated));
  }
}
