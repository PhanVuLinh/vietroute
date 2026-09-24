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
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.ordersService.findAll({
      page,
      limit: pageSize || limit,
      status,
      priority,
      search,
      warehouseId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/pod')
  completePod(
    @Param('id') id: string,
    @Body() podDto: any,
  ) {
    return this.ordersService.completePod(id, podDto);
  }
}
