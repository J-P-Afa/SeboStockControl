import { Inject, Injectable } from '@nestjs/common';
import type { PublisherRepository } from '../../domain/publisher.repository';

@Injectable()
export class GetPublishersUseCase {
  constructor(
    @Inject('PublisherRepository')
    private readonly publisherRepo: PublisherRepository,
  ) {}

  async execute() {
    const publishers = await this.publisherRepo.findAll();

    return { success: true, data: publishers };
  }
}
