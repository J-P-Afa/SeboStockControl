import { PERMISSIONS_KEY } from '../../common';
import { TipoEntradaController } from './tipo-entrada.controller';

describe('TipoEntradaController permissions', () => {
  it('uses entrada permissions for read and write operations', () => {
    const findAllPermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoEntradaController.prototype.findAll,
    );
    const createPermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoEntradaController.prototype.create,
    );
    const updatePermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoEntradaController.prototype.update,
    );
    const deletePermissions = Reflect.getMetadata(
      PERMISSIONS_KEY,
      TipoEntradaController.prototype.remove,
    );

    expect(findAllPermissions).toEqual(['entrada:read']);
    expect(createPermissions).toEqual(['entrada:create']);
    expect(updatePermissions).toEqual(['entrada:update']);
    expect(deletePermissions).toEqual(['entrada:delete']);
  });
});
