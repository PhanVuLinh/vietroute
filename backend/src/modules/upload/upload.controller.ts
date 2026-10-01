import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UploadService } from './upload.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        `Định dạng tệp ${file.mimetype} không được hỗ trợ. Chỉ chấp nhận Ảnh (PNG, JPG, WEBP) hoặc Tài liệu (PDF, Word, Excel).`,
      ),
      false,
    );
  }
};

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
      fileFilter,
    }),
  )
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.processUploadedFile(file);
  }

  @Post('batch')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter,
    }),
  )
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một tệp tin');
    }
    return files.map((file) => this.uploadService.processUploadedFile(file));
  }

  @Post('base64')
  uploadBase64(
    @Body('data') data: string,
    @Body('prefix') prefix?: string,
  ) {
    return this.uploadService.saveBase64Image(data, prefix);
  }
}
