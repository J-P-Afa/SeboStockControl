import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PrismaIdiomaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.idioma.findMany({
      where: includeInactive ? undefined : { ativo: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.idioma.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.idioma.findUnique({ where: { descricao } });
  }

  create(data: { descricao: string; ativo?: boolean }) {
    return this.prisma.idioma.create({ data });
  }

  update(id: number, data: { descricao?: string; ativo?: boolean }) {
    return this.prisma.idioma.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.idioma.delete({ where: { id } });
  }
}
