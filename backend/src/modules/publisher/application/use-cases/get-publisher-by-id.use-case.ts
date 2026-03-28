import { Inject, Injectable } from '@nestjs/common';
import type { PublisherRepository } from '../../domain/publisher.repository';

@Injectable()
export class GetPublisherByIdUseCase {
  constructor(
    @Inject('PublisherRepository')
    private readonly publisherRepo: PublisherRepository,
  ) {}

  async execute(id: number) {
    const publisher = await this.publisherRepo.findById(id);

    if (!publisher) {
      return { success: false, error: 'Editora não encontrada' };
    }

    return { success: true, data: publisher };
  }
}
