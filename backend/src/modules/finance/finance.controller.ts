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
import { FinanceService } from './finance.service.js';
import { CreateCodReconciliationDto } from './dto/create-cod-reconciliation.dto.js';
import { SubmitCodDto } from './dto/submit-cod.dto.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ==========================================
  // 1. ĐỐI SOÁT COD
  // ==========================================

  @Get('cod')
  getCodReconciliations(
    @Query('driverId') driverId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.financeService.getCodReconciliations({ driverId, status, search });
  }

  @Get('cod/summary')
  getCodSummary() {
    return this.financeService.getCodSummary();
  }

  @Get('cod/:id')
  getCodReconciliationById(@Param('id') id: string) {
    return this.financeService.getCodReconciliationById(id);
  }

  @Post('cod')
  createCodReconciliation(@Body() dto: CreateCodReconciliationDto) {
    return this.financeService.createCodReconciliation(dto);
  }

  @Post('cod/:id/submit')
  submitCod(@Param('id') id: string, @Body() dto: SubmitCodDto) {
    return this.financeService.submitCod(id, dto);
  }

  // ==========================================
  // 2. HÓA ĐƠN & CÔNG NỢ B2B
  // ==========================================

  @Get('invoices')
  getInvoices(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.financeService.getInvoices({ customerId, status, search });
  }

  @Get('invoices/summary')
  getBillingSummary() {
    return this.financeService.getBillingSummary();
  }

  @Get('invoices/aging-report')
  getAgingReport() {
    return this.financeService.getAgingReport();
  }

  @Get('invoices/:id')
  getInvoiceById(@Param('id') id: string) {
    return this.financeService.getInvoiceById(id);
  }

  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Patch('invoices/:id/status')
  updateInvoiceStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.financeService.updateInvoiceStatus(id, dto);
  }

  @Post('invoices/:id/send-reminder')
  sendSingleInvoiceReminder(@Param('id') id: string) {
    return this.financeService.sendSingleInvoiceReminder(id);
  }

  @Post('debt-collection/scan-and-remind')
  scanAndSendDebtReminders() {
    return this.financeService.scanAndSendDebtReminders();
  }

  @Post('seed-demo')
  seedDemoData() {
    return this.financeService.seedDemoData();
  }
}

