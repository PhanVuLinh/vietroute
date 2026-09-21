import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType, ValidationPipe } from '@nestjs/common';

import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
          'http://localhost:5176',
          'http://localhost:3000',
          'http://localhost:3001',
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Định tuyến API
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động vứt bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: false, // Không bắn lỗi 400 nếu client gửi kèm field phụ
      transform: true, // Tự động chuyển đổi payload thành instance của DTO class
    }),
  );

  // Gắn Interceptor (Thành công) và Filter (Lỗi)
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
