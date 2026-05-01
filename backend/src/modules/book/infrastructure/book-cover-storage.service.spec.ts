import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Prisma } from '@prisma/client';
import { BookCoverStorageService } from './book-cover-storage.service';
import { InMemoryBookRepository } from './in-memory-book.repository';

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
]);

function makeBook(repo: InMemoryBookRepository, coverUrl?: string | null) {
  return repo.create({
    title: 'Cover Book',
    condition: 'novo',
    status: 'completo',
    editionType: 'normal',
    weight: new Prisma.Decimal(100),
    coverUrl,
  });
}

describe('BookCoverStorageService', () => {
  let tempDir: string;
  let repo: InMemoryBookRepository;
  let service: BookCoverStorageService;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'book-covers-'));
    repo = new InMemoryBookRepository();
    service = new BookCoverStorageService(repo, tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('uploads a valid image, updates coverUrl, and deletes the previous managed file', async () => {
    const book = await makeBook(repo);
    const previousRelativeUrl = `/uploads/book-covers/${book.id}/old.png`;
    const previousPath = join(
      tempDir,
      'book-covers',
      String(book.id),
      'old.png',
    );
    await writeFile(previousPath, png, { flag: 'w' }).catch(async () => {
      await service.uploadCover(book.id, {
        buffer: png,
        mimetype: 'image/png',
        size: png.length,
      });
      const current = await repo.findById(book.id);
      if (!current?.coverUrl) throw new Error('Missing seeded cover');
      await repo.update(book.id, { coverUrl: previousRelativeUrl });
      await writeFile(previousPath, png);
    });

    const updated = await service.uploadCover(book.id, {
      buffer: png,
      mimetype: 'image/png',
      originalname: 'not-trusted.png',
      size: png.length,
    });

    expect(updated.coverUrl).toMatch(
      new RegExp(`^/uploads/book-covers/${book.id}/cover-[a-f0-9-]+\\.png$`),
    );
    await expect(stat(previousPath)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(
      await readFile(join(tempDir, updated.coverUrl!.replace('/uploads/', ''))),
    ).toEqual(png);
  });

  it('rejects invalid uploads and missing books', async () => {
    const book = await makeBook(repo);

    await expect(
      service.uploadCover(book.id, {
        buffer: Buffer.from('plain text'),
        mimetype: 'text/plain',
        size: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.uploadCover(999, {
        buffer: png,
        mimetype: 'image/png',
        size: png.length,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('imports only http image URLs and removes covers', async () => {
    const book = await makeBook(repo);
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({
        'content-type': 'image/png',
        'content-length': String(png.length),
      }),
      arrayBuffer: () =>
        Promise.resolve(
          png.buffer.slice(png.byteOffset, png.byteOffset + png.length),
        ),
    } as Response);

    const imported = await service.importCover(
      book.id,
      'https://example.com/cover.png',
    );

    expect(imported.coverUrl).toContain(`/uploads/book-covers/${book.id}/`);
    await expect(
      service.importCover(book.id, 'file:///tmp/cover.png'),
    ).rejects.toBeInstanceOf(BadRequestException);

    const removed = await service.removeCover(book.id);

    expect(removed.coverUrl).toBeNull();
    await expect(
      stat(join(tempDir, imported.coverUrl!.replace('/uploads/', ''))),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
