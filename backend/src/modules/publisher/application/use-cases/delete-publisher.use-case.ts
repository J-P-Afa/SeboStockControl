import { Inject, Injectable } from '@nestjs/common';
import type { PublisherRepository } from '../../domain/publisher.repository';

@Injectable()
export class DeletePublisherUseCase {
  constructor(
    @Inject('PublisherRepository')
    private readonly publisherRepo: PublisherRepository,
  ) {}

  async execute(id: number) {
    const exists = await this.publisherRepo.findById(id);

    if (!exists) {
      return { success: false, error: 'Editora não encontrada' };
    }

    const deleted = await this.publisherRepo.delete(id);

    if (!deleted) {
      return { success: false, error: 'Erro ao deletar editora' };
    }

    return { success: true };
  }
}
