import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  processUploadedFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy tệp tin tải lên');
    }

    const hostUrl = process.env.PUBLIC_API_URL || '';
    const fileUrl = `${hostUrl}/uploads/${file.filename}`;

    return {
      url: fileUrl,
      relativePath: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  saveBase64Image(base64Data: string, prefix = 'pod-evidence') {
    if (!base64Data) {
      throw new BadRequestException('Dữ liệu ảnh base64 không hợp lệ');
    }

    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let extension = 'png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      const matchExt = mime.split('/')[1];
      if (matchExt) {
        extension = matchExt === 'jpeg' ? 'jpg' : matchExt;
      }
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const filename = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const filePath = join(this.uploadDir, filename);

    writeFileSync(filePath, buffer);

    const hostUrl = process.env.PUBLIC_API_URL || '';
    return {
      url: `${hostUrl}/uploads/${filename}`,
      relativePath: `/uploads/${filename}`,
      filename,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
    };
  }
}
