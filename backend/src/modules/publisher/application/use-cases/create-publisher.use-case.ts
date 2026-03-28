import { Inject, Injectable } from '@nestjs/common';
import type { PublisherRepository } from '../../domain/publisher.repository';
import { PublisherEntity } from '../../domain/publisher.entity';

interface CreatePublisherInput {
  description: string;
}

@Injectable()
export class CreatePublisherUseCase {
  constructor(
    @Inject('PublisherRepository')
    private readonly publisherRepo: PublisherRepository,
  ) {}

  async execute(input: CreatePublisherInput) {
    try {
      const publisher = PublisherEntity.create({
        description: input.description,
        isActive: true,
      });

      const saved = await this.publisherRepo.create(publisher);

      return { success: true, data: saved };
    } catch {
      return { success: false, error: 'Erro ao criar editora' };
    }
  }
}
