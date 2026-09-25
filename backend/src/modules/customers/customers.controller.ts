import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { BulkCreateOrderDto, PayDebtDto } from './dto/bulk-create-order.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('portal/:id/dashboard')
  getPortalDashboard(@Param('id') id: string) {
    return this.customersService.getPortalDashboard(id);
  }

  @Get('portal/:id/active-cargo')
  getActiveCargo(@Param('id') id: string) {
    return this.customersService.getActiveCargo(id);
  }

  @Post('portal/:id/bulk-orders')
  createBulkOrders(@Param('id') id: string, @Body() dto: BulkCreateOrderDto) {
    return this.customersService.createBulkOrders(id, dto);
  }

  @Post('portal/:id/pay-debt')
  payDebt(@Param('id') id: string, @Body() dto: PayDebtDto) {
    return this.customersService.payDebt(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.customersService.findAll({ page, limit, search, type });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'DISPATCHER')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}

