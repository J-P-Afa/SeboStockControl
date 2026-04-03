import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockExecutionContext = (user?: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false when no permissions are required (FAIL-SAFE)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = mockExecutionContext({ permissions: [] });

      // Fixed behavior (secure):
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true when user has all required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:data']);
      const context = mockExecutionContext({
        permissions: ['read:data', 'write:data'],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false when user is missing a required permission', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['read:data', 'admin']);
      const context = mockExecutionContext({ permissions: ['read:data'] });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false when user has no permissions at all', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:data']);
      const context = mockExecutionContext({ permissions: [] });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false when user object is missing from request', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:data']);
      const context = mockExecutionContext(undefined);

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
