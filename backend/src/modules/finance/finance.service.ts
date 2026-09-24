import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCodReconciliationDto } from './dto/create-cod-reconciliation.dto.js';
import { SubmitCodDto } from './dto/submit-cod.dto.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto.js';
import { CodReconciliationStatus, InvoiceStatus, PaymentMethod, CustomerType, CustomerTier } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

@Injectable()
export class FinanceService implements OnModuleInit {
  private readonly logger = new Logger('FinanceService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async onModuleInit() {
    await this.autoSeedFinanceIfEmpty();
  }

  private async autoSeedFinanceIfEmpty() {
    try {
      const invoiceCount = await this.prisma.invoice.count();
      if (invoiceCount === 0) {
        this.logger.log('📦 Bảng hóa đơn đang trống. Tự động nạp hóa đơn B2B chuẩn vào PostgreSQL...');

        // 1. Tạo hoặc lấy khách hàng doanh nghiệp
        const cus1 = await this.prisma.customer.upsert({
          where: { id: 'cus-vinamilk' },
          update: {},
          create: {
            id: 'cus-vinamilk',
            name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
            tax_code: '0300588569',
            phone: '02854155555',
            email: 'vinamilk@vinamilk.com.vn',
            address: 'Số 10 Tân Trào, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
            latitude: 10.7303,
            longitude: 106.7196,
            type: CustomerType.ENTERPRISE,
            tier: CustomerTier.VIP,
            contact_person: 'Trần Thị Mai',
          },
        });

        const cus2 = await this.prisma.customer.upsert({
          where: { id: 'cus-samsung' },
          update: {},
          create: {
            id: 'cus-samsung',
            name: 'Công ty TNHH Samsung Electronics Việt Nam',
            tax_code: '2300324888',
            phone: '02223696000',
            email: 'sev.logistics@samsung.com',
            address: 'KCN Yên Phong, Xã Yên Trung, Huyện Yên Phong, Tỉnh Bắc Ninh',
            latitude: 21.1969,
            longitude: 105.9723,
            type: CustomerType.ENTERPRISE,
            tier: CustomerTier.VIP,
            contact_person: 'Nguyễn Văn Minh',
          },
        });

        const cus3 = await this.prisma.customer.upsert({
          where: { id: 'cus-vingroup' },
          update: {},
          create: {
            id: 'cus-vingroup',
            name: 'Tập đoàn Vingroup - CTCP (VinFast Logistics)',
            tax_code: '0101245486',
            phone: '02439749999',
            email: 'vinfast.scm@vingroup.net',
            address: 'Số 7 Đường Bằng Lăng 1, KĐT Vinhomes Riverside, Long Biên, Hà Nội',
            latitude: 21.0478,
            longitude: 105.9082,
            type: CustomerType.ENTERPRISE,
            tier: CustomerTier.VIP,
            contact_person: 'Lê Hoàng Long',
          },
        });

        const cus4 = await this.prisma.customer.upsert({
          where: { id: 'cus-shopee' },
          update: {},
          create: {
            id: 'cus-shopee',
            name: 'Công ty TNHH Shopee Express Việt Nam',
            tax_code: '0313580556',
            phone: '19001221',
            email: 'spx.partner@shopee.vn',
            address: 'Tầng 17 Saigon Centre 2, 67 Lê Lợi, P. Bến Nghé, Quận 1, TP. HCM',
            latitude: 10.7731,
            longitude: 106.7006,
            type: CustomerType.ENTERPRISE,
            tier: CustomerTier.GOLD,
            contact_person: 'Hoàng Phương Thảo',
          },
        });

        // 2. Tạo 4 Hóa đơn B2B phong phú
        const now = new Date();
        const due15Days = new Date(now.getTime() + 15 * 86400000);
        const due30Days = new Date(now.getTime() + 30 * 86400000);
        const overdue5Days = new Date(now.getTime() - 5 * 86400000);

        // Hóa đơn 1: Vinamilk (Chờ thanh toán)
        await this.prisma.invoice.create({
          data: {
            id: 'inv-001',
            invoice_code: 'INV-2026-001',
            customer_id: cus1.id,
            due_date: due15Days,
            subtotal: 23000000,
            vat_amount: 1840000,
            discount_amount: 0,
            total_amount: 24840000,
            paid_amount: 0,
            status: InvoiceStatus.PENDING_PAYMENT,
            payment_terms: 'Net 30',
            notes: 'Cước vận chuyển chuỗi cung ứng lạnh sữa tươi Hà Nội - Hải Phòng hợp đồng tháng 09/2026',
            items: {
              create: [
                {
                  description: 'Cước xe tải lạnh 5 tấn tuyến Hà Nội - Cảng Đình Vũ (Hải Phòng)',
                  quantity: 4,
                  unit_price: 4500000,
                  amount: 18000000,
                },
                {
                  description: 'Phí bốc dỡ hàng tại kho lạnh trung tâm Long Biên',
                  quantity: 1,
                  unit_price: 5000000,
                  amount: 5000000,
                },
              ],
            },
          },
        });

        // Hóa đơn 2: Samsung (Quá hạn thanh toán 5 ngày)
        await this.prisma.invoice.create({
          data: {
            id: 'inv-002',
            invoice_code: 'INV-2026-002',
            customer_id: cus2.id,
            due_date: overdue5Days,
            subtotal: 42000000,
            vat_amount: 3360000,
            discount_amount: 0,
            total_amount: 45360000,
            paid_amount: 0,
            status: InvoiceStatus.OVERDUE,
            payment_terms: 'Net 15',
            notes: 'Cước xe tải bảo an vận chuyển linh kiện điện tử KCN Yên Phong - Sân bay Nội Bài',
            items: {
              create: [
                {
                  description: 'Vận chuyển linh kiện chip bán dẫn xe container chuyên dụng có niêm phong hải quan',
                  quantity: 6,
                  unit_price: 7000000,
                  amount: 42000000,
                },
              ],
            },
          },
        });

        // Hóa đơn 3: Vingroup / VinFast (Đã thanh toán đủ)
        await this.prisma.invoice.create({
          data: {
            id: 'inv-003',
            invoice_code: 'INV-2026-003',
            customer_id: cus3.id,
            due_date: now,
            subtotal: 80000000,
            vat_amount: 6400000,
            discount_amount: 2000000,
            total_amount: 84400000,
            paid_amount: 84400000,
            status: InvoiceStatus.PAID,
            payment_terms: 'Thanh toán ngay',
            notes: 'Hợp đồng vận chuyển phụ tùng và khung xe điện VinFast Hải Phòng - Hà Nội',
            items: {
              create: [
                {
                  description: 'Cước vận chuyển phụ tùng xe điện trọn gói 10 chuyến xe tải 10 tấn',
                  quantity: 10,
                  unit_price: 8000000,
                  amount: 80000000,
                },
              ],
            },
          },
        });

        // Hóa đơn 4: Shopee Express (Chờ thanh toán)
        await this.prisma.invoice.create({
          data: {
            id: 'inv-004',
            invoice_code: 'INV-2026-004',
            customer_id: cus4.id,
            due_date: due30Days,
            subtotal: 17500000,
            vat_amount: 1400000,
            discount_amount: 0,
            total_amount: 18900000,
            paid_amount: 0,
            status: InvoiceStatus.PENDING_PAYMENT,
            payment_terms: 'Net 30',
            notes: 'Dịch vụ trung chuyển bưu kiện liên tỉnh trục Bắc - Nam',
            items: {
              create: [
                {
                  description: 'Thuê bao xe tải trung chuyển line-haul Hub Long Biên - Hub Đà Nẵng',
                  quantity: 1,
                  unit_price: 17500000,
                  amount: 17500000,
                },
              ],
            },
          },
        });

        this.logger.log('✅ Đã nạp thành công 4 hóa đơn B2B chuẩn vào PostgreSQL.');
      }

      // 3. Tự động nạp dữ liệu Đối soát COD nếu đang trống
      const codCount = await this.prisma.codReconciliation.count();
      if (codCount === 0) {
        this.logger.log('💵 Bảng đối soát COD đang trống. Khởi tạo phiên COD mẫu...');
        const drivers = await this.prisma.driver.findMany({ take: 2 });
        if (drivers.length > 0) {
          await this.prisma.codReconciliation.create({
            data: {
              reconciliation_code: 'COD-2026-001',
              driver_id: drivers[0].id,
              date: new Date(),
              total_orders: 8,
              total_cod_amount: 12500000,
              collected_amount: 12500000,
              submitted_amount: 12500000,
              discrepancy: 0,
              status: CodReconciliationStatus.SETTLED,
              cashier_name: 'Thủ quỹ Nguyễn Mai Lan',
              confirmed_at: new Date(),
              notes: 'Tài xế đã hoàn tất nộp đủ 100% tiền mặt ca sáng',
            },
          });

          if (drivers.length > 1) {
            await this.prisma.codReconciliation.create({
              data: {
                reconciliation_code: 'COD-2026-002',
                driver_id: drivers[1].id,
                date: new Date(),
                total_orders: 6,
                total_cod_amount: 9800000,
                collected_amount: 9800000,
                submitted_amount: 9500000,
                discrepancy: 300000,
                status: CodReconciliationStatus.DISCREPANCY,
                cashier_name: 'Thủ quỹ Nguyễn Mai Lan',
                notes: 'Tài xế báo khách hàng hẹn chuyển khoản 300.000 đ vào tài khoản công ty chiều nay',
              },
            });
          }
          this.logger.log('✅ Đã nạp thành công các phiên đối soát COD mẫu vào PostgreSQL.');
        }
      }
    } catch (err) {
      this.logger.error(`Lỗi khi auto seed finance: ${(err as any)?.message}`);
    }
  }

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

    const formatted = this.formatCodReconciliation(updated);

    // Phát sóng sự kiện nộp tiền COD qua Socket.IO
    this.realtimeGateway.emitCodSubmitted({
      id: formatted.id,
      reconciliationCode: formatted.reconciliationCode,
      driverName: formatted.driverName,
      submittedAmount: formatted.submittedAmount,
      discrepancy: formatted.discrepancy,
      status: formatted.status,
    });

    return formatted;
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
