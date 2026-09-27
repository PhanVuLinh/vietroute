import { Module } from '@nestjs/common';
import { InternationalService } from './international.service.js';
import { InternationalController } from './international.controller.js';

@Module({
  controllers: [InternationalController],
  providers: [InternationalService],
  exports: [InternationalService],
})
export class InternationalModule {}
