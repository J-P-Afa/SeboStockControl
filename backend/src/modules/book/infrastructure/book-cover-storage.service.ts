import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  BOOK_REPOSITORY,
  type IBookRepository,
} from '../domain/book.repository.interface';
import { BookResponseDto } from '../application/dtos/book-response.dto';

export const BOOK_COVER_UPLOAD_ROOT = Symbol('BOOK_COVER_UPLOAD_ROOT');

export interface UploadedCoverFile {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size: number;
}

const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

@Injectable()
export class BookCoverStorageService {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepo: IBookRepository,
    @Optional()
    @Inject(BOOK_COVER_UPLOAD_ROOT)
    private readonly uploadRoot: string = join(process.cwd(), 'uploads'),
  ) {}

  async uploadCover(
    bookId: number,
    file: UploadedCoverFile | undefined,
  ): Promise<BookResponseDto> {
    const existing = await this.findBookOrThrow(bookId);
    if (!file) throw new BadRequestException('Arquivo de capa é obrigatório');

    const extension = this.validateFile(file.mimetype, file.size);
    const relativeUrl = await this.writeCover(bookId, extension, file.buffer);

    try {
      const updated = await this.bookRepo.update(bookId, {
        coverUrl: relativeUrl,
      });
      await this.deleteManagedCover(existing.coverUrl);
      return BookResponseDto.fromEntity(updated);
    } catch (error) {
      await this.deleteManagedCover(relativeUrl);
      throw error;
    }
  }

  async importCover(
    bookId: number,
    sourceUrl: string,
  ): Promise<BookResponseDto> {
    const existing = await this.findBookOrThrow(bookId);
    const url = this.validateSourceUrl(sourceUrl);
    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException('Não foi possível baixar a capa informada');
    }

    const contentType = response.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .toLowerCase();
    const contentLength = response.headers.get('content-length');
    const expectedSize = contentLength ? Number(contentLength) : undefined;
    const extension = this.validateFile(contentType ?? '', expectedSize ?? 0, {
      allowUnknownSize: true,
    });

    if (expectedSize !== undefined && expectedSize > MAX_COVER_SIZE_BYTES) {
      throw new BadRequestException('Capa excede o tamanho máximo de 5 MB');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_COVER_SIZE_BYTES) {
      throw new BadRequestException('Capa excede o tamanho máximo de 5 MB');
    }

    const relativeUrl = await this.writeCover(bookId, extension, buffer);

    try {
      const updated = await this.bookRepo.update(bookId, {
        coverUrl: relativeUrl,
      });
      await this.deleteManagedCover(existing.coverUrl);
      return BookResponseDto.fromEntity(updated);
    } catch (error) {
      await this.deleteManagedCover(relativeUrl);
      throw error;
    }
  }

  async removeCover(bookId: number): Promise<BookResponseDto> {
    const existing = await this.findBookOrThrow(bookId);
    const updated = await this.bookRepo.update(bookId, { coverUrl: null });
    await this.deleteManagedCover(existing.coverUrl);
    return BookResponseDto.fromEntity(updated);
  }

  private async findBookOrThrow(bookId: number) {
    const book = await this.bookRepo.findById(bookId);
    if (!book) throw new NotFoundException('Livro não encontrado');
    return book;
  }

  private validateSourceUrl(sourceUrl: string): string {
    let url: URL;
    try {
      url = new URL(sourceUrl);
    } catch {
      throw new BadRequestException('URL de capa inválida');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new BadRequestException('URL de capa deve usar HTTP ou HTTPS');
    }

    return url.toString();
  }

  private validateFile(
    mimetype: string,
    size: number,
    options: { allowUnknownSize?: boolean } = {},
  ): string {
    const extension = ALLOWED_MIME_TYPES.get(mimetype.toLowerCase());
    if (!extension) {
      throw new BadRequestException('Capa deve ser JPEG, PNG ou WebP');
    }

    if (!options.allowUnknownSize && size <= 0) {
      throw new BadRequestException('Arquivo de capa vazio');
    }

    if (size > MAX_COVER_SIZE_BYTES) {
      throw new BadRequestException('Capa excede o tamanho máximo de 5 MB');
    }

    return extension;
  }

  private async writeCover(
    bookId: number,
    extension: string,
    buffer: Buffer,
  ): Promise<string> {
    const directory = join(this.uploadRoot, 'book-covers', String(bookId));
    await mkdir(directory, { recursive: true });

    const filename = `cover-${randomUUID()}.${extension}`;
    await writeFile(join(directory, filename), buffer, { flag: 'wx' });

    return `/uploads/book-covers/${bookId}/${filename}`;
  }

  private async deleteManagedCover(coverUrl: string | null | undefined) {
    if (!coverUrl?.startsWith('/uploads/book-covers/')) return;

    const relativePath = coverUrl.replace('/uploads/', '');
    const absolutePath = resolve(this.uploadRoot, relativePath);
    const uploadsRoot = resolve(this.uploadRoot);

    if (!absolutePath.startsWith(`${uploadsRoot}/`)) return;
    await rm(absolutePath, { force: true });
  }
}
