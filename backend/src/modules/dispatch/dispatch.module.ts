import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service.js';
import { DispatchController } from './dispatch.controller.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [AiModule],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}

