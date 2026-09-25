import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { WmsService } from './wms.service.js';
import { CreateInboundDto } from './dto/create-inbound.dto.js';
import { CreateOutboundDto } from './dto/create-outbound.dto.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { ScanDockDto } from './dto/scan-dock.dto.js';
import { ScanInboundDto } from './dto/scan-inbound.dto.js';
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

  // ==========================================
  // WMS SCANNER KIOSK ENDPOINTS
  // ==========================================

  @Get('scanner/dock-sessions')
  @Roles('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF', 'DISPATCHER', 'DRIVER')
  getDockScanSessions(@Query('warehouseId') warehouseId?: string) {
    return this.wmsService.getDockScanSessions(warehouseId);
  }

  @Post('scanner/scan-dock')
  @Roles('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF', 'DISPATCHER', 'DRIVER')
  scanDockItem(@Body() dto: ScanDockDto) {
    return this.wmsService.scanDockItem(dto);
  }

  @Post('scanner/scan-inbound')
  @Roles('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')
  scanInboundItem(@Body() dto: ScanInboundDto) {
    return this.wmsService.scanInboundItem(dto);
  }

  @Get('scanner/lookup/:barcode')
  @Roles('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF', 'DISPATCHER', 'DRIVER')
  lookupBarcode(
    @Param('barcode') barcode: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.wmsService.lookupBarcode(barcode, warehouseId);
  }
}

