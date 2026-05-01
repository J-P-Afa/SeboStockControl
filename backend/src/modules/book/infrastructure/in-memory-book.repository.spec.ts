import { Condition, Status, EditionType } from '@prisma/client';
import { InMemoryBookRepository } from './in-memory-book.repository';

describe('InMemoryBookRepository', () => {
  let repository: InMemoryBookRepository;

  beforeEach(() => {
    repository = new InMemoryBookRepository();
  });

  it('should sort books by title', async () => {
    await repository.create({
      title: 'B',
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
      weight: 500 as any,
    });
    await repository.create({
      title: 'A',
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
      weight: 500 as any,
    });

    const result = await repository.findAll({
      sortBy: 'title',
      sortOrder: 'asc',
    });
    expect(result.items[0].title).toBe('A');
    expect(result.items[1].title).toBe('B');
  });

  it('should sort books by title descending', async () => {
    await repository.create({
      title: 'A',
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
      weight: 500 as any,
    });
    await repository.create({
      title: 'B',
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
      weight: 500 as any,
    });

    const result = await repository.findAll({
      sortBy: 'title',
      sortOrder: 'desc',
    });
    expect(result.items[0].title).toBe('B');
    expect(result.items[1].title).toBe('A');
  });

  it('should handle null values when sorting', async () => {
    await repository.create({
      title: 'A',
      subtitle: 'Sub',
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
      weight: 500 as any,
    });
    await repository.create({
      title: 'B',
      subtitle: null,
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
      weight: 500 as any,
    });

    const result = await repository.findAll({
      sortBy: 'subtitle',
      sortOrder: 'asc',
    });
    // 'Sub' vs null. Null should be last in my implementation (return 1 for valA == null)
    expect(result.items[0].subtitle).toBe('Sub');
    expect(result.items[1].subtitle).toBeNull();
  });

  it('should sort by Decimal fields correctly', async () => {
    const { Prisma } = await import('@prisma/client');
    await repository.create({
      title: 'A',
      weight: new Prisma.Decimal(100),
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
    });
    await repository.create({
      title: 'B',
      weight: new Prisma.Decimal(50),
      condition: Condition.novo,
      status: Status.completo,
      editionType: EditionType.normal,
    });

    const result = await repository.findAll({
      sortBy: 'weight',
      sortOrder: 'asc',
    });
    expect(result.items[0].title).toBe('B'); // 50 < 100
    expect(result.items[1].title).toBe('A');
  });
});
