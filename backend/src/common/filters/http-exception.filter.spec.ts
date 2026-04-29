import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function createMockHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('HttpExceptionFilter', () => {
  it('preserves structured HttpException responses', () => {
    const { host, response } = createMockHost();
    const filter = new HttpExceptionFilter();

    filter.catch(
      new NotFoundException({
        code: 'TIPO_SAIDA_NOT_FOUND',
        message: 'Tipo de saída não encontrado',
      }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'TIPO_SAIDA_NOT_FOUND',
        message: 'Tipo de saída não encontrado',
      },
    });
  });

  it('maps Prisma foreign key violations to a conflict response', () => {
    const { host, response } = createMockHost();
    const filter = new HttpExceptionFilter();

    filter.catch(
      {
        code: 'P2003',
        clientVersion: '7.5.0',
        meta: { modelName: 'TipoSaida', field_name: 'tipo_saida_id' },
      },
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'FOREIGN_KEY_CONSTRAINT',
        message:
          'Não é possível excluir este registro porque ele já está sendo usado.',
      },
    });
  });
});
