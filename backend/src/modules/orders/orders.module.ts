import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { PublicTrackingController } from './public-tracking.controller.js';

@Module({
  controllers: [OrdersController, PublicTrackingController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

