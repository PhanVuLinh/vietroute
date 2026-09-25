import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { BulkCreateOrderDto, PayDebtDto } from './dto/bulk-create-order.dto.js';

@Controller('portal/b2b')
export class B2BPortalController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':id/dashboard')
  getPortalDashboard(@Param('id') id: string) {
    return this.customersService.getPortalDashboard(id);
  }

  @Get(':id/active-cargo')
  getActiveCargo(@Param('id') id: string) {
    return this.customersService.getActiveCargo(id);
  }

  @Post(':id/bulk-orders')
  createBulkOrders(@Param('id') id: string, @Body() dto: BulkCreateOrderDto) {
    return this.customersService.createBulkOrders(id, dto);
  }

  @Post(':id/pay-debt')
  payDebt(@Param('id') id: string, @Body() dto: PayDebtDto) {
    return this.customersService.payDebt(id, dto);
  }
}
