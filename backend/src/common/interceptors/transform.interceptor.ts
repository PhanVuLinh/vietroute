import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        // Nếu API có trả về message riêng thì dùng, không thì để null
        message: data?.message || 'Xử lý thành công',
        // Lấy phần data thực sự
        data: data?.message ? data.data : data,
      })),
    );
  }
}
