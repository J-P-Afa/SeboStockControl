import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import {
  IBookRepository,
  CreateLivroParams,
  UpdateLivroParams,
  LivroFilters,
} from '../domain/book.repository.interface';
import { LivroEntity, EstadoLivro } from '../domain/livro.entity';

/**
 * @ai-context Implementação do repositório usando Prisma.
 * A criação do Estoque (RULE [LIV-01]) é feita via transação atômica neste repositório.
 */
@Injectable()
export class PrismaBookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): LivroEntity {
    return LivroEntity.restore({
      id: raw.id,
      classificacaoId: raw.classificacaoId,
      editoraId: raw.editoraId,
      idiomaId: raw.idiomaId,
      descricao: raw.descricao,
      capa: raw.capa,
      isbn13: raw.isbn13,
      isbn10: raw.isbn10,
      edicaoEspecial: raw.edicaoEspecial,
      volume: raw.volume,
      estado: raw.estado,
      colecao: raw.colecao,
      pesoGramas: raw.pesoGramas !== null ? Number(raw.pesoGramas) : null,
      precoTabelado: raw.precoTabelado !== null ? Number(raw.precoTabelado) : null,
      ativo: raw.ativo,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: number): Promise<LivroEntity | null> {
    const raw = await this.prisma.livro.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findAll(filters?: LivroFilters): Promise<LivroEntity[]> {
    const where: any = {};
    if (filters?.ativo !== undefined) where.ativo = filters.ativo;
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.classificacaoId) where.classificacaoId = filters.classificacaoId;
    if (filters?.editoraId) where.editoraId = filters.editoraId;
    if (filters?.idiomaId) where.idiomaId = filters.idiomaId;
    if (filters?.search) {
      where.OR = [
        { descricao: { contains: filters.search, mode: 'insensitive' } },
        { isbn13: { contains: filters.search } },
        { isbn10: { contains: filters.search } },
      ];
    }
    const raws = await this.prisma.livro.findMany({ where, orderBy: { descricao: 'asc' } });
    return raws.map((r) => this.toEntity(r));
  }

  async findByIsbn13AndEstado(isbn13: string, estado: EstadoLivro): Promise<LivroEntity | null> {
    const raw = await this.prisma.livro.findFirst({ where: { isbn13, estado } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByIsbn10AndEstado(isbn10: string, estado: EstadoLivro): Promise<LivroEntity | null> {
    const raw = await this.prisma.livro.findFirst({ where: { isbn10, estado } });
    return raw ? this.toEntity(raw) : null;
  }

  /**
   * Cria o Livro e o Estoque inicial em transação atômica.
   * @ai-context Implementa RULE [LIV-01]: criar estoque zerado junto com o livro.
   */
  async create(data: CreateLivroParams): Promise<LivroEntity> {
    const raw = await this.prisma.$transaction(async (tx) => {
      const livro = await tx.livro.create({
        data: {
          classificacaoId: data.classificacaoId,
          editoraId: data.editoraId,
          idiomaId: data.idiomaId,
          descricao: data.descricao,
          capa: data.capa,
          isbn13: data.isbn13,
          isbn10: data.isbn10,
          edicaoEspecial: data.edicaoEspecial ?? 'normal',
          volume: data.volume,
          estado: data.estado,
          colecao: data.colecao,
          pesoGramas: data.pesoGramas,
          precoTabelado: data.precoTabelado,
          ativo: data.ativo ?? true,
        },
      });
      // RULE [LIV-01]: criar estoque zerado automaticamente
      await tx.estoque.create({
        data: { livroId: livro.id, quantidade: 0, custoUnitarioMedio: 0, custoTotal: 0 },
      });
      return livro;
    });
    return this.toEntity(raw);
  }

  async update(id: number, data: UpdateLivroParams): Promise<LivroEntity> {
    const raw = await this.prisma.livro.update({ where: { id }, data });
    return this.toEntity(raw);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.livro.delete({ where: { id } });
  }
}