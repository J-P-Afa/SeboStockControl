import { Inject, Injectable } from '@nestjs/common';
import type { PublisherRepository } from '../../domain/publisher.repository';

interface UpdatePublisherInput {
  id: number;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdatePublisherUseCase {
  constructor(
    @Inject('PublisherRepository')
    private readonly publisherRepo: PublisherRepository,
  ) {}

  async execute(input: UpdatePublisherInput) {
    const publisher = await this.publisherRepo.findById(input.id);

    if (!publisher) {
      return { success: false, error: 'Publisher não encontrada' };
    }

    try {
      if (input.description !== undefined) {
        publisher.updateDescription(input.description);
      }

      if (input.isActive !== undefined) {
        input.isActive ? publisher.activate() : publisher.deactivate();
      }

      const updated = await this.publisherRepo.update(publisher);

      return { success: true, data: updated };
    } catch {
      return { success: false, error: 'Erro ao atualizar publisher' };
    }
  }
}
