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
import { AuditAction, OrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Audit } from '../../common/decorators/audit.decorator.js';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Permissions('orders:view')
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
  @Permissions('orders:view')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Permissions('orders:create')
  @Audit({ action: AuditAction.CREATE, entityType: 'Order', summary: 'Tạo đơn hàng vận tải mới' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @Permissions('orders:edit')
  @Audit({ action: AuditAction.UPDATE, entityType: 'Order', summary: 'Cập nhật trạng thái đơn hàng' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/pod')
  @Permissions('orders:pod')
  @Audit({ action: AuditAction.UPDATE, entityType: 'Order', summary: 'Ký nhận biên bản giao hàng e-POD' })
  completePod(
    @Param('id') id: string,
    @Body() podDto: any,
  ) {
    return this.ordersService.completePod(id, podDto);
  }
}
