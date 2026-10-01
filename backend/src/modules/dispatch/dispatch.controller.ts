import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DispatchService } from './dispatch.service.js';
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('dispatch')
@UseGuards(JwtAuthGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('assignments')
  getAssignments() {
    return this.dispatchService.getAssignments();
  }

  @Post('assign')
  assignDelivery(@Body() dto: AssignDeliveryDto) {
    return this.dispatchService.assignDelivery(dto);
  }

  @Post('auto-batch')
  autoDispatchBatch() {
    return this.dispatchService.autoDispatchBatch();
  }

  @Get('ai-match/:orderId')
  getAiDriverMatches(@Param('orderId') orderId: string) {
    return this.dispatchService.getAiDriverMatches(orderId);
  }
}

