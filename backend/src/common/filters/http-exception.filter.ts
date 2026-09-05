import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống máy chủ';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      errorType = exception.name;

      // Lấy chi tiết lỗi (Hỗ trợ bóc tách mảng lỗi từ ValidationPipe)
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      // Nếu có nhiều lỗi (ví dụ quên nhập email, mật khẩu), chỉ lấy lỗi đầu tiên cho gọn
      message: Array.isArray(message) ? message[0] : message,
      error: errorType,
    });
  }
}
