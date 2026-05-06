import { describe, it, expect, beforeEach } from 'vitest';
import { of, lastValueFrom } from 'rxjs';
import { ResponseWrapperInterceptor } from './response-wrapper.interceptor';

describe('ResponseWrapperInterceptor', () => {
  let interceptor: ResponseWrapperInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseWrapperInterceptor();
  });

  it('wraps response data in standard envelope', async () => {
    const mockData = { id: 1, name: 'Test' };
    const callHandler = { handle: () => of(mockData) };

    const result = await lastValueFrom(
      interceptor.intercept({} as any, callHandler),
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('wraps null data correctly', async () => {
    const callHandler = { handle: () => of(null) };

    const result = await lastValueFrom(
      interceptor.intercept({} as any, callHandler),
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it('wraps array data correctly', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    const callHandler = { handle: () => of(mockData) };

    const result = await lastValueFrom(
      interceptor.intercept({} as any, callHandler),
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });
});
