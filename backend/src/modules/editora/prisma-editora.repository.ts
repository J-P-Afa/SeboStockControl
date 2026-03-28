import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PrismaEditoraRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.editora.findMany({
      where: includeInactive ? undefined : { ativo: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.editora.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.editora.findUnique({ where: { descricao } });
  }

  create(data: { descricao: string; ativo?: boolean }) {
    return this.prisma.editora.create({ data });
  }

  update(id: number, data: { descricao?: string; ativo?: boolean }) {
    return this.prisma.editora.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.editora.delete({ where: { id } });
  }
}
