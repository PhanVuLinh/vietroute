import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller.js';
import { PublicInvoiceController } from './public-invoice.controller.js';
import { FinanceService } from './finance.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController, PublicInvoiceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

