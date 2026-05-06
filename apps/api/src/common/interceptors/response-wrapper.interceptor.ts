import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface WrappedResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly error: null;
  readonly timestamp: string;
}

@Injectable()
export class ResponseWrapperInterceptor<T>
  implements NestInterceptor<T, WrappedResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<WrappedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        error: null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
