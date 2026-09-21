import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WmsService } from './wms.service.js';
import { CreateInboundDto } from './dto/create-inbound.dto.js';
import { CreateOutboundDto } from './dto/create-outbound.dto.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('wms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WmsController {
  constructor(private readonly wmsService: WmsService) {}

  @Get('inventory')
  getInventory(@Query('warehouseId') warehouseId?: string) {
    return this.wmsService.getInventory(warehouseId);
  }

  @Get('inbounds')
  getInboundReceipts(@Query('warehouseId') warehouseId?: string) {
    return this.wmsService.getInboundReceipts(warehouseId);
  }

  @Post('inbounds')
  @Roles('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')
  createInboundReceipt(@Body() dto: CreateInboundDto) {
    return this.wmsService.createInboundReceipt(dto);
  }

  @Get('outbounds')
  getOutboundDispatches(@Query('warehouseId') warehouseId?: string) {
    return this.wmsService.getOutboundDispatches(warehouseId);
  }

  @Post('outbounds')
  @Roles('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF', 'DISPATCHER')
  createOutboundDispatch(@Body() dto: CreateOutboundDto) {
    return this.wmsService.createOutboundDispatch(dto);
  }

  @Get('transfers')
  getStockTransfers(@Query('warehouseId') warehouseId?: string) {
    return this.wmsService.getStockTransfers(warehouseId);
  }

  @Post('transfers')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'WAREHOUSE_STAFF')
  createStockTransfer(@Body() dto: CreateTransferDto) {
    return this.wmsService.createStockTransfer(dto);
  }

  @Get('activities')
  getActivityLog(@Query('warehouseId') warehouseId?: string) {
    return this.wmsService.getActivityLog(warehouseId);
  }
}
