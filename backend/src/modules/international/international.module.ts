import { Module } from '@nestjs/common';
import { InternationalService } from './international.service.js';
import { InternationalController } from './international.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [InternationalController],
  providers: [InternationalService],
  exports: [InternationalService],
})
export class InternationalModule {}

