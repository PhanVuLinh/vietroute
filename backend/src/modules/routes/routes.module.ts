import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service.js';
import { RoutesController } from './routes.controller.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [AiModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}

