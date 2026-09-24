import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

@Controller('public/tracking')
export class PublicTrackingController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':orderCode')
  getPublicTracking(@Param('orderCode') orderCode: string) {
    return this.ordersService.getPublicTracking(orderCode);
  }

  @Post(':orderCode/feedback')
  submitFeedback(
    @Param('orderCode') orderCode: string,
    @Body() body: { rating: number; feedbackText?: string; reviewerName?: string },
  ) {
    return this.ordersService.submitPublicFeedback(orderCode, body);
  }
}
