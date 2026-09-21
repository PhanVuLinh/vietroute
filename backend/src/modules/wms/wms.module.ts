import { Module } from '@nestjs/common';
import { WmsController } from './wms.controller.js';
import { WmsService } from './wms.service.js';

@Module({
  controllers: [WmsController],
  providers: [WmsService],
  exports: [WmsService],
})
export class WmsModule {}
