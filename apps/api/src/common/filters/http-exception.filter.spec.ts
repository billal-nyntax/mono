import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({}),
      }),
    };
  });

  it('catches HttpException and returns proper response format', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: null,
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      }),
    );
    const body = mockJson.mock.calls[0][0];
    expect(body.timestamp).toBeDefined();
  });

  it('extracts message array from BadRequestException', () => {
    const exception = new BadRequestException(['field is required', 'field must be string']);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = mockJson.mock.calls[0][0];
    expect(body.error).toBe('field is required, field must be string');
  });

  it('returns 500 for unknown (non-HttpException) errors', () => {
    const exception = new Error('something broke');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: null,
        error: 'something broke',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });

  it('returns generic message for non-Error exceptions', () => {
    filter.catch('string-error', mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = mockJson.mock.calls[0][0];
    expect(body.error).toBe('Internal server error');
  });
});
