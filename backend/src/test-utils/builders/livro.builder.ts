import { Livro, EdicaoEspecial, EstadoLivro, ColecaoLivro } from '@prisma/client';
import { Decimal } from '../decimal';

export class LivroBuilder {
  private props: Partial<Livro> = {
    id: 1,
    descricao: 'Livro de Teste',
    classificacaoId: 1,
    editoraId: 1,
    idiomaId: 1,
    edicaoEspecial: EdicaoEspecial.normal,
    estado: EstadoLivro.novo,
    colecao: ColecaoLivro.completa,
    ativo: true,
    precoTabelado: new Decimal('100.00'),
  };

  static aLivro(): LivroBuilder {
    return new LivroBuilder();
  }

  withId(id: number): this {
    this.props.id = id;
    return this;
  }

  withDescricao(descricao: string): this {
    this.props.descricao = descricao;
    return this;
  }

  inactive(): this {
    this.props.ativo = false;
    return this;
  }

  withPrecoTabelado(preco: string | number): this {
    this.props.precoTabelado = new Decimal(preco);
    return this;
  }

  build(): Livro {
    return this.props as Livro;
  }
}
