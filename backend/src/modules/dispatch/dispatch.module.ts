import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service.js';
import { DispatchController } from './dispatch.controller.js';

@Module({
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
