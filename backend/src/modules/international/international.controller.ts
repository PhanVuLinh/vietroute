import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { InternationalService } from './international.service.js';
import { CreateInternationalShipmentDto } from './dto/create-shipment.dto.js';
import { CreateCustomsDeclarationDto } from './dto/create-customs.dto.js';

@Controller('international')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternationalController {
  constructor(private readonly internationalService: InternationalService) {}

  // 1. Shipments Endpoints
  @Get('shipments')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'ACCOUNTANT')
  getShipments(
    @Query('direction') direction?: string,
    @Query('mode') mode?: string,
    @Query('incoterm') incoterm?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.internationalService.getShipments({
      direction,
      mode,
      incoterm,
      status,
      search,
    });
  }

  @Get('shipments/:id')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  getShipmentById(@Param('id') id: string) {
    return this.internationalService.getShipmentById(id);
  }

  @Post('shipments')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  createShipment(@Body() dto: CreateInternationalShipmentDto) {
    return this.internationalService.createShipment(dto);
  }

  @Put('shipments/:id')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  updateShipment(
    @Param('id') id: string,
    @Body() dto: Partial<CreateInternationalShipmentDto>,
  ) {
    return this.internationalService.updateShipment(id, dto);
  }

  @Delete('shipments/:id')
  @Roles('ADMIN', 'MANAGER')
  deleteShipment(@Param('id') id: string) {
    return this.internationalService.deleteShipment(id);
  }

  // 2. Customs Endpoints
  @Get('customs')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'ACCOUNTANT')
  getCustomsDeclarations(
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.internationalService.getCustomsDeclarations({
      channel,
      status,
      search,
    });
  }

  @Post('customs')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  createCustomsDeclaration(@Body() dto: CreateCustomsDeclarationDto) {
    return this.internationalService.createCustomsDeclaration(dto);
  }

  @Patch('customs/:id/status')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  updateCustomsStatus(
    @Param('id') id: string,
    @Body('status') status: 'DRAFT' | 'REGISTERED' | 'CLEARED' | 'REJECTED',
  ) {
    return this.internationalService.updateCustomsStatus(id, status);
  }

  // 3. Container & Port & Rate Metadata
  @Get('containers')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  getContainers() {
    return this.internationalService.getContainers();
  }

  @Get('ports')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'ACCOUNTANT')
  getPorts() {
    return this.internationalService.getPorts();
  }

  @Get('exchange-rates')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'ACCOUNTANT')
  getExchangeRates() {
    return this.internationalService.getExchangeRates();
  }

  @Get('local-charges')
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER', 'ACCOUNTANT')
  getLocalCharges() {
    return this.internationalService.getLocalCharges();
  }
}
