import { PERMISSIONS_KEY } from '../../common';
import { TipoSaidaController } from './tipo-saida.controller';

describe('TipoSaidaController permissions', () => {
  it('uses the seeded saida:create permission for write operations', () => {
    const createPermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoSaidaController.prototype.create,
    );
    const updatePermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoSaidaController.prototype.update,
    );
    const deletePermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoSaidaController.prototype.remove,
    );

    expect(createPermissions).toEqual(['saida:create']);
    expect(updatePermissions).toEqual(['saida:update']);
    expect(deletePermissions).toEqual(['saida:delete']);
  });
});
