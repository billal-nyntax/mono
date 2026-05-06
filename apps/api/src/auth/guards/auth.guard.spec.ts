import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: any;
  let reflector: any;

  const mockUser = { id: 'user-1', email: 'john@example.com', role: 'user' };
  const mockSession = { userId: 'user-1', token: 'valid-token' };

  function createMockContext(headers: Record<string, string | undefined> = {}) {
    const request = { headers, user: undefined as unknown };
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
      _request: request,
    };
  }

  beforeEach(() => {
    authService = {
      verifySession: vi.fn(),
      getUser: vi.fn(),
    };

    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
    };

    guard = new AuthGuard(authService, reflector);
  });

  it('allows access when route is public', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createMockContext();

    const result = await guard.canActivate(ctx as any);

    expect(result).toBe(true);
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const ctx = createMockContext({});

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when token format is invalid', async () => {
    const ctx = createMockContext({ authorization: 'InvalidFormat' });

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when session is invalid or expired', async () => {
    authService.verifySession.mockResolvedValue(null);
    const ctx = createMockContext({ authorization: 'Bearer expired-token' });

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when user is not found', async () => {
    authService.verifySession.mockResolvedValue(mockSession);
    authService.getUser.mockResolvedValue(null);
    const ctx = createMockContext({ authorization: 'Bearer valid-token' });

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('sets request.user and returns true for valid token', async () => {
    authService.verifySession.mockResolvedValue(mockSession);
    authService.getUser.mockResolvedValue(mockUser);
    const ctx = createMockContext({ authorization: 'Bearer valid-token' });

    const result = await guard.canActivate(ctx as any);

    expect(result).toBe(true);
    expect(ctx._request.user).toEqual(mockUser);
  });
});
