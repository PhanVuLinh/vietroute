import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service.js';
import { DeliveryStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.deliveriesService.findAll({
      page,
      limit: pageSize || limit,
      status,
      driverId,
      vehicleId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Get(':id/history')
  findHistory(@Param('id') id: string) {
    return this.deliveriesService.findHistory(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: DeliveryStatus,
    @Body('note') note?: string,
  ) {
    return this.deliveriesService.updateStatus(id, status, note);
  }

  @Post(':id/pod')
  completePod(
    @Param('id') id: string,
    @Body() podDto: any,
  ) {
    return this.deliveriesService.completePod(id, podDto);
  }
}
