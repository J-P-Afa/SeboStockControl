import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaClassificacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.classificacao.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { descricao: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.classificacao.findUnique({ where: { id } });
  }

  async findByDescricao(descricao: string) {
    return this.prisma.classificacao.findUnique({ where: { descricao } });
  }

  async create(data: {
    descricao: string;
    isActive?: boolean;
    margemAlvo?: number;
  }) {
    return this.prisma.classificacao.create({
      data: {
        descricao: data.descricao,
        isActive: data.isActive,
        margemAlvo: data.margemAlvo ?? 0,
      },
    });
  }

  async update(
    id: number,
    data: { descricao?: string; isActive?: boolean; margemAlvo?: number },
  ) {
    return this.prisma.classificacao.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.classificacao.delete({ where: { id } });
  }
}
