import { Module } from '@nestjs/common';

import { PublisherController } from './controllers/publisher.controller';

import { PrismaService } from '../database';
import { PrismaPublisherRepository } from './infrastructure/prisma-publisher.repository';

import { CreatePublisherUseCase } from './application/use-cases/create-publisher.use-case';
import { GetPublishersUseCase } from './application/use-cases/get-publishers.use-case';
import { GetPublisherByIdUseCase } from './application/use-cases/get-publisher-by-id.use-case';
import { UpdatePublisherUseCase } from './application/use-cases/update-publisher.use-case';
import { DeletePublisherUseCase } from './application/use-cases/delete-publisher.use-case';

@Module({
  controllers: [PublisherController],
  providers: [
    PrismaService,

    {
      provide: 'PublisherRepository',
      useClass: PrismaPublisherRepository,
    },

    CreatePublisherUseCase,
    GetPublishersUseCase,
    GetPublisherByIdUseCase,
    UpdatePublisherUseCase,
    DeletePublisherUseCase,
  ],
})
export class PublisherModule {}
