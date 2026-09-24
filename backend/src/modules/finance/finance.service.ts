import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCodReconciliationDto } from './dto/create-cod-reconciliation.dto.js';
import { SubmitCodDto } from './dto/submit-cod.dto.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto.js';
import { CodReconciliationStatus, InvoiceStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private formatCodReconciliation(r: any) {
    return {
      id: r.id,
      reconciliationCode: r.reconciliation_code,
      driverId: r.driver_id,
      driverName: r.driver?.full_name || 'N/A',
      driverPhone: r.driver?.phone || 'N/A',
      date: r.date ? (r.date instanceof Date ? r.date.toISOString() : r.date) : new Date().toISOString(),
      totalOrders: r.total_orders,
      totalCodAmount: r.total_cod_amount,
      collectedAmount: r.collected_amount,
      submittedAmount: r.submitted_amount,
      discrepancy: r.discrepancy,
      status: r.status,
      notes: r.notes,
      cashierName: r.cashier_name,
      confirmedAt: r.confirmed_at ? (r.confirmed_at instanceof Date ? r.confirmed_at.toISOString() : r.confirmed_at) : null,
      entriesCount: r.entries ? r.entries.length : 0,
      entries: r.entries?.map((e: any) => ({
        id: e.id,
        orderId: e.order_id,
        orderCode: e.order?.order_code || e.order_id,
        receiverName: e.order?.receiver_name || 'Khách hàng',
        receiverPhone: e.order?.receiver_phone || '',
        expectedCod: e.expected_cod,
        actualCollected: e.actual_collected,
        paymentMethod: e.payment_method,
        isDiscrepant: e.is_discrepant,
        discrepancyReason: e.discrepancy_reason,
      })) || [],
    };
  }

  private formatInvoice(inv: any) {
    return {
      id: inv.id,
      invoiceCode: inv.invoice_code,
      customerId: inv.customer_id,
      customerName: inv.customer?.name || 'Khách hàng B2B',
      customerPhone: inv.customer?.phone || '',
      customerAddress: inv.customer?.address || '',
      customerTaxCode: inv.customer?.tax_code || '',
      issueDate: inv.issue_date instanceof Date ? inv.issue_date.toISOString() : inv.issue_date,
      dueDate: inv.due_date instanceof Date ? inv.due_date.toISOString() : inv.due_date,
      subtotal: inv.subtotal,
      vatAmount: inv.vat_amount,
      discountAmount: inv.discount_amount,
      totalAmount: inv.total_amount,
      paidAmount: inv.paid_amount,
      remainingAmount: inv.total_amount - inv.paid_amount,
      status: inv.status,
      paymentTerms: inv.payment_terms,
      notes: inv.notes,
      itemsCount: inv.items ? inv.items.length : 0,
      items: inv.items?.map((it: any) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unit_price,
        amount: it.amount,
      })) || [],
    };
  }

  // ==========================================
  // 1. ĐỐI SOÁT TIỀN THU HỘ COD (RECONCILIATION)
  // ==========================================

  async getCodReconciliations(query?: {
    driverId?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (query?.driverId && query.driverId !== 'ALL') {
      where.driver_id = query.driverId;
    }

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as CodReconciliationStatus;
    }

    if (query?.search) {
      where.OR = [
        { reconciliation_code: { contains: query.search, mode: 'insensitive' } },
        { driver: { full_name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const list = await this.prisma.codReconciliation.findMany({
      where,
      include: {
        driver: true,
        entries: {
          include: {
            order: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return list.map((r) => ({
      id: r.id,
      reconciliationCode: r.reconciliation_code,
      driverId: r.driver_id,
      driverName: r.driver.full_name,
      driverPhone: r.driver.phone,
      date: r.date.toISOString(),
      totalOrders: r.total_orders,
      totalCodAmount: r.total_cod_amount,
      collectedAmount: r.collected_amount,
      submittedAmount: r.submitted_amount,
      discrepancy: r.discrepancy,
      status: r.status,
      notes: r.notes,
      cashierName: r.cashier_name,
      confirmedAt: r.confirmed_at ? r.confirmed_at.toISOString() : null,
      entriesCount: r.entries.length,
    }));
  }

  async getCodReconciliationById(id: string) {
    const r = await this.prisma.codReconciliation.findUnique({
      where: { id },
      include: {
        driver: true,
        entries: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!r) {
      throw new NotFoundException(`Không tìm thấy phiên đối soát với ID: ${id}`);
    }

    return this.formatCodReconciliation(r);
  }

  async createCodReconciliation(dto: CreateCodReconciliationDto) {
    const code = `COD-${Date.now().toString().slice(-6)}`;
    const date = dto.date ? new Date(dto.date) : new Date();

    const entries = dto.entries || [];
    const totalOrders = entries.length;
    const totalCodAmount = entries.reduce((acc, curr) => acc + (curr.expected_cod || 0), 0);
    const collectedAmount = entries.reduce((acc, curr) => acc + (curr.actual_collected || 0), 0);

    const rec = await this.prisma.codReconciliation.create({
      data: {
        reconciliation_code: code,
        driver_id: dto.driver_id,
        date,
        total_orders: totalOrders,
        total_cod_amount: totalCodAmount,
        collected_amount: collectedAmount,
        submitted_amount: 0,
        discrepancy: collectedAmount,
        status: CodReconciliationStatus.PENDING,
        notes: dto.notes,
        entries: {
          create: entries.map((e) => ({
            order_id: e.order_id,
            expected_cod: e.expected_cod,
            actual_collected: e.actual_collected,
            payment_method: e.payment_method || PaymentMethod.CASH,
            is_discrepant: e.expected_cod !== e.actual_collected,
            discrepancy_reason: e.discrepancy_reason,
          })),
        },
      },
      include: {
        driver: true,
        entries: true,
      },
    });

    return this.formatCodReconciliation(rec);
  }

  async submitCod(id: string, dto: SubmitCodDto) {
    const r = await this.prisma.codReconciliation.findUnique({
      where: { id },
    });

    if (!r) {
      throw new NotFoundException(`Không tìm thấy phiên đối soát với ID: ${id}`);
    }

    // Tính toán chênh lệch
    const discrepancy = r.collected_amount - dto.submitted_amount;
    let status: CodReconciliationStatus = CodReconciliationStatus.SETTLED;

    if (discrepancy > 0 && dto.submitted_amount > 0) {
      status = CodReconciliationStatus.PARTIAL;
    } else if (discrepancy !== 0) {
      status = CodReconciliationStatus.DISCREPANCY;
    } else if (dto.submitted_amount === 0 && r.collected_amount > 0) {
      status = CodReconciliationStatus.PENDING;
    }

    const updated = await this.prisma.codReconciliation.update({
      where: { id },
      data: {
        submitted_amount: dto.submitted_amount,
        discrepancy,
        status,
        cashier_name: dto.cashier_name || 'Phan Vũ Linh (Kế toán)',
        confirmed_at: new Date(),
        notes: dto.notes ? `${r.notes ? r.notes + ' | ' : ''}${dto.notes}` : r.notes,
      },
      include: {
        driver: true,
        entries: true,
      },
    });

    return this.formatCodReconciliation(updated);
  }

  async getCodSummary() {
    const all = await this.prisma.codReconciliation.findMany();

    const totalCodExpected = all.reduce((acc, curr) => acc + curr.total_cod_amount, 0);
    const totalCollected = all.reduce((acc, curr) => acc + curr.collected_amount, 0);
    const totalSubmitted = all.reduce((acc, curr) => acc + curr.submitted_amount, 0);
    const totalDiscrepancy = all.reduce((acc, curr) => acc + Math.abs(curr.discrepancy), 0);

    const pendingCount = all.filter((r) => r.status === CodReconciliationStatus.PENDING).length;
    const discrepancyCount = all.filter((r) => r.status === CodReconciliationStatus.DISCREPANCY).length;
    const settledCount = all.filter((r) => r.status === CodReconciliationStatus.SETTLED).length;

    return {
      totalCodExpected,
      totalCollected,
      totalSubmitted,
      totalDiscrepancy,
      pendingCount,
      discrepancyCount,
      settledCount,
      totalSessions: all.length,
    };
  }

  // ==========================================
  // 2. HÓA ĐƠN & CÔNG NỢ B2B (INVOICING)
  // ==========================================

  async getInvoices(query?: {
    customerId?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (query?.customerId && query.customerId !== 'ALL') {
      where.customer_id = query.customerId;
    }

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as InvoiceStatus;
    }

    if (query?.search) {
      where.OR = [
        { invoice_code: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const list = await this.prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: { issue_date: 'desc' },
    });

    return list.map((inv) => ({
      id: inv.id,
      invoiceCode: inv.invoice_code,
      customerId: inv.customer_id,
      customerName: inv.customer.name,
      customerTaxCode: inv.customer.tax_code,
      issueDate: inv.issue_date.toISOString(),
      dueDate: inv.due_date.toISOString(),
      subtotal: inv.subtotal,
      vatAmount: inv.vat_amount,
      discountAmount: inv.discount_amount,
      totalAmount: inv.total_amount,
      paidAmount: inv.paid_amount,
      remainingAmount: inv.total_amount - inv.paid_amount,
      status: inv.status,
      paymentTerms: inv.payment_terms,
      notes: inv.notes,
      itemsCount: inv.items.length,
    }));
  }

  async getInvoiceById(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!inv) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID: ${id}`);
    }

    return this.formatInvoice(inv);
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const code = `INV-${Date.now().toString().slice(-6)}`;
    const subtotal = dto.items.reduce((acc, curr) => acc + curr.quantity * curr.unit_price, 0);
    const vatRate = dto.vat_rate !== undefined ? dto.vat_rate : 0.08;
    const vatAmount = Math.round(subtotal * vatRate);
    const discount = dto.discount_amount || 0;
    const totalAmount = subtotal + vatAmount - discount;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoice_code: code,
        customer_id: dto.customer_id,
        due_date: new Date(dto.due_date),
        subtotal,
        vat_amount: vatAmount,
        discount_amount: discount,
        total_amount: totalAmount,
        paid_amount: 0,
        status: InvoiceStatus.PENDING_PAYMENT,
        payment_terms: dto.payment_terms || 'Net 30',
        notes: dto.notes,
        items: {
          create: dto.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            amount: it.quantity * it.unit_price,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return this.formatInvoice(invoice);
  }

  async updateInvoiceStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!inv) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID: ${id}`);
    }

    let paidAmount = inv.paid_amount;
    if (dto.paid_amount !== undefined) {
      paidAmount = dto.paid_amount;
    } else if (dto.status === InvoiceStatus.PAID) {
      paidAmount = inv.total_amount;
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: dto.status,
        paid_amount: paidAmount,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return this.formatInvoice(updated);
  }

  async getAgingReport() {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: {
          in: [InvoiceStatus.PENDING_PAYMENT, InvoiceStatus.OVERDUE],
        },
      },
      include: {
        customer: true,
      },
    });

    const now = new Date().getTime();
    let bucketCurrent = 0;   // Chưa đến hạn
    let bucket1To30 = 0;     // Quá hạn 1 - 30 ngày
    let bucket31To60 = 0;    // Quá hạn 31 - 60 ngày
    let bucketOver60 = 0;    // Quá hạn > 60 ngày

    for (const inv of invoices) {
      const remaining = inv.total_amount - inv.paid_amount;
      const dueTime = new Date(inv.due_date).getTime();
      const diffDays = Math.floor((now - dueTime) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        bucketCurrent += remaining;
      } else if (diffDays <= 30) {
        bucket1To30 += remaining;
      } else if (diffDays <= 60) {
        bucket31To60 += remaining;
      } else {
        bucketOver60 += remaining;
      }
    }

    return {
      current: bucketCurrent,
      days1To30: bucket1To30,
      days31To60: bucket31To60,
      daysOver60: bucketOver60,
      totalUnpaid: bucketCurrent + bucket1To30 + bucket31To60 + bucketOver60,
      overdueInvoicesCount: invoices.filter((i) => new Date(i.due_date).getTime() < now).length,
    };
  }

  async getBillingSummary() {
    const all = await this.prisma.invoice.findMany();

    const totalRevenue = all.reduce((acc, curr) => acc + curr.total_amount, 0);
    const totalCollected = all.reduce((acc, curr) => acc + curr.paid_amount, 0);
    const totalPending = totalRevenue - totalCollected;

    const overdueCount = all.filter(
      (i) => i.status === InvoiceStatus.OVERDUE || (i.status === InvoiceStatus.PENDING_PAYMENT && new Date(i.due_date) < new Date())
    ).length;

    return {
      totalRevenue,
      totalCollected,
      totalPending,
      overdueCount,
      totalInvoices: all.length,
    };
  }
}
