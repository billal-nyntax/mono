import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: any;

  function createMockContext(user?: { role: string }) {
    const request = { user };
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    };
  }

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    };

    guard = new RolesGuard(reflector);
  });

  it('allows access when no @Roles decorator is set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockContext({ role: 'user' });

    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('allows access when roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const ctx = createMockContext({ role: 'user' });

    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('allows access when user has a matching role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'super_admin']);
    const ctx = createMockContext({ role: 'admin' });

    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('throws ForbiddenException when user role does not match', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'super_admin']);
    const ctx = createMockContext({ role: 'user' });

    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is missing from request', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = createMockContext(undefined);

    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });
});
