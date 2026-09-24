import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FinanceService } from './finance.service.js';

@Controller('public/portal/invoices')
export class PublicInvoiceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get(':invoiceCode')
  getPublicInvoice(@Param('invoiceCode') invoiceCode: string) {
    return this.financeService.getPublicInvoice(invoiceCode);
  }

  @Post(':invoiceCode/pay')
  simulatePayment(
    @Param('invoiceCode') invoiceCode: string,
    @Body() body?: { paymentMethod?: string; transactionRef?: string },
  ) {
    return this.financeService.simulatePublicInvoicePayment(invoiceCode, body);
  }
}
