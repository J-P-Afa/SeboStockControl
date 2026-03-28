import { PublisherEntity } from './publisher.entity';

export interface PublisherRepository {
  create(publisher: PublisherEntity): Promise<PublisherEntity>;
  findById(id: number): Promise<PublisherEntity | null>;
  findByDescription(description: string): Promise<PublisherEntity | null>;
  findAll(): Promise<PublisherEntity[]>;
  update(publisher: PublisherEntity): Promise<PublisherEntity>;
  delete(id: number): Promise<boolean>;
}
