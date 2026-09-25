import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInboundDto } from './dto/create-inbound.dto.js';
import { CreateOutboundDto } from './dto/create-outbound.dto.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { ScanDockDto } from './dto/scan-dock.dto.js';
import { ScanInboundDto } from './dto/scan-inbound.dto.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { InboundStatus, OrderStatus, OutboundStatus, TransferStatus, WmsActivityType } from '@prisma/client';

@Injectable()
export class WmsService {
  // In-memory cache lưu các kiện đã quét cho các lệnh xuất kho đang bốc dỡ (Dock sessions)
  private scannedDockItems = new Map<string, Set<string>>();

  constructor(
    private prisma: PrismaService,
    @Optional() private realtimeGateway?: RealtimeGateway,
  ) {}

  async getInventory(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouse_id = warehouseId;

    const items = await this.prisma.inventoryItem.findMany({
      where,
      orderBy: { product_name: 'asc' },
    });

    return items.map((i) => ({
      id: i.id,
      sku: i.sku,
      productName: i.product_name,
      warehouseId: i.warehouse_id,
      zoneCode: i.zone_code,
      quantity: i.quantity,
      reservedQuantity: i.reserved_quantity,
      unit: i.unit,
      weightPerUnit: i.weight_per_unit,
      minStockLevel: i.min_stock_level,
      lastUpdated: i.last_updated.toISOString(),
    }));
  }

  async getInboundReceipts(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouse_id = warehouseId;

    const list = await this.prisma.inboundReceipt.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return list.map((r) => ({
      id: r.id,
      receiptCode: r.receipt_code,
      warehouseId: r.warehouse_id,
      supplierName: r.supplier_name,
      itemCount: r.item_count,
      totalWeight: r.total_weight,
      status: r.status,
      receivedBy: r.received_by,
      notes: r.notes || undefined,
      createdAt: r.created_at.toISOString(),
      completedAt: r.completed_at ? r.completed_at.toISOString() : undefined,
    }));
  }

  async createInboundReceipt(dto: CreateInboundDto) {
    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.inboundReceipt.create({
        data: {
          warehouse_id: dto.warehouse_id,
          receipt_code: dto.receipt_code,
          supplier_name: dto.supplier_name,
          item_count: dto.item_count,
          total_weight: dto.total_weight,
          status: dto.status || InboundStatus.RECEIVING,
          received_by: dto.received_by,
          notes: dto.notes,
        },
      });

      // Tự động ghi nhật ký hoạt động kho (Audit log)
      await tx.warehouseActivity.create({
        data: {
          warehouse_id: dto.warehouse_id,
          type: WmsActivityType.INBOUND,
          description: `Nhập kho ${dto.item_count} kiện hàng từ ${dto.supplier_name}`,
          user: dto.received_by,
          reference_code: dto.receipt_code,
          quantity: dto.item_count,
        },
      });

      return {
        id: receipt.id,
        receiptCode: receipt.receipt_code,
        warehouseId: receipt.warehouse_id,
        supplierName: receipt.supplier_name,
        itemCount: receipt.item_count,
        totalWeight: receipt.total_weight,
        status: receipt.status,
        receivedBy: receipt.received_by,
        notes: receipt.notes || undefined,
        createdAt: receipt.created_at.toISOString(),
      };
    });
  }

  async getOutboundDispatches(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouse_id = warehouseId;

    const list = await this.prisma.outboundDispatch.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return list.map((o) => ({
      id: o.id,
      dispatchCode: o.dispatch_code,
      warehouseId: o.warehouse_id,
      orderCode: o.order_code || undefined,
      routeCode: o.route_code || undefined,
      itemCount: o.item_count,
      totalWeight: o.total_weight,
      status: o.status,
      pickedBy: o.picked_by,
      notes: o.notes || undefined,
      createdAt: o.created_at.toISOString(),
      completedAt: o.completed_at ? o.completed_at.toISOString() : undefined,
    }));
  }

  async createOutboundDispatch(dto: CreateOutboundDto) {
    return this.prisma.$transaction(async (tx) => {
      const dispatch = await tx.outboundDispatch.create({
        data: {
          warehouse_id: dto.warehouse_id,
          dispatch_code: dto.dispatch_code,
          order_code: dto.order_code,
          route_code: dto.route_code,
          item_count: dto.item_count,
          total_weight: dto.total_weight,
          status: dto.status || OutboundStatus.PICKING,
          picked_by: dto.picked_by,
          notes: dto.notes,
        },
      });

      // Tự động ghi nhật ký kho
      await tx.warehouseActivity.create({
        data: {
          warehouse_id: dto.warehouse_id,
          type: WmsActivityType.OUTBOUND,
          description: `Xuất kho ${dto.item_count} kiện theo lệnh ${dto.dispatch_code}`,
          user: dto.picked_by,
          reference_code: dto.dispatch_code,
          quantity: dto.item_count,
        },
      });

      return {
        id: dispatch.id,
        dispatchCode: dispatch.dispatch_code,
        warehouseId: dispatch.warehouse_id,
        orderCode: dispatch.order_code || undefined,
        routeCode: dispatch.route_code || undefined,
        itemCount: dispatch.item_count,
        totalWeight: dispatch.total_weight,
        status: dispatch.status,
        pickedBy: dispatch.picked_by,
        notes: dispatch.notes || undefined,
        createdAt: dispatch.created_at.toISOString(),
      };
    });
  }

  async getStockTransfers(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) {
      where.OR = [
        { from_warehouse_id: warehouseId },
        { to_warehouse_id: warehouseId },
      ];
    }

    const list = await this.prisma.stockTransfer.findMany({
      where,
      include: {
        from_warehouse: { select: { name: true } },
        to_warehouse: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return list.map((t) => ({
      id: t.id,
      transferCode: t.transfer_code,
      fromWarehouseId: t.from_warehouse_id,
      fromWarehouseName: t.from_warehouse.name,
      toWarehouseId: t.to_warehouse_id,
      toWarehouseName: t.to_warehouse.name,
      itemCount: t.item_count,
      totalWeight: t.total_weight,
      status: t.status,
      createdBy: t.created_by,
      createdAt: t.created_at.toISOString(),
      completedAt: t.completed_at ? t.completed_at.toISOString() : undefined,
    }));
  }

  async createStockTransfer(dto: CreateTransferDto) {
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.create({
        data: {
          from_warehouse_id: dto.from_warehouse_id,
          to_warehouse_id: dto.to_warehouse_id,
          transfer_code: dto.transfer_code,
          item_count: dto.item_count,
          total_weight: dto.total_weight,
          status: dto.status || TransferStatus.IN_TRANSIT,
          created_by: dto.created_by,
        },
        include: {
          from_warehouse: { select: { name: true } },
          to_warehouse: { select: { name: true } },
        },
      });

      await tx.warehouseActivity.create({
        data: {
          warehouse_id: dto.from_warehouse_id,
          type: WmsActivityType.TRANSFER,
          description: `Điều chuyển ${dto.item_count} kiện sang ${transfer.to_warehouse.name}`,
          user: dto.created_by,
          reference_code: dto.transfer_code,
          quantity: dto.item_count,
        },
      });

      return {
        id: transfer.id,
        transferCode: transfer.transfer_code,
        fromWarehouseId: transfer.from_warehouse_id,
        fromWarehouseName: transfer.from_warehouse.name,
        toWarehouseId: transfer.to_warehouse_id,
        toWarehouseName: transfer.to_warehouse.name,
        itemCount: transfer.item_count,
        totalWeight: transfer.total_weight,
        status: transfer.status,
        createdBy: transfer.created_by,
        createdAt: transfer.created_at.toISOString(),
      };
    });
  }

  async getActivityLog(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouse_id = warehouseId;

    const list = await this.prisma.warehouseActivity.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return list.map((a) => ({
      id: a.id,
      warehouseId: a.warehouse_id,
      type: a.type,
      description: a.description,
      user: a.user,
      referenceCode: a.reference_code,
      quantity: a.quantity || undefined,
      createdAt: a.created_at.toISOString(),
    }));
  }

  // ==========================================
  // WMS BARCODE & QR SCANNER KIOSK METHODS
  // ==========================================

  /**
   * Lấy danh sách các phiên bốc hàng lên xe tại cổng Dock (Dock Scan-to-Dispatch)
   */
  async getDockScanSessions(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouse_id = warehouseId;

    // Lấy các lệnh xuất kho gần nhất
    let dispatches = await this.prisma.outboundDispatch.findMany({
      where,
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // Nếu kho chưa có lệnh xuất kho nào, tự động liên kết từ các đơn hàng hiện có trong DB
    if (dispatches.length === 0) {
      const activeOrders = await this.prisma.order.findMany({
        take: 6,
        orderBy: { created_at: 'desc' },
      });

      const targetWh = (warehouseId
        ? await this.prisma.warehouse.findUnique({ where: { id: warehouseId } })
        : await this.prisma.warehouse.findFirst()) || await this.prisma.warehouse.findFirst();

      if (targetWh && activeOrders.length > 0) {
        for (let idx = 0; idx < activeOrders.length; idx++) {
          const ord = activeOrders[idx];
          const dispCode = `DSP-2026-${(idx + 1).toString().padStart(3, '0')}`;
          try {
            await this.prisma.outboundDispatch.upsert({
              where: { dispatch_code: dispCode },
              update: { warehouse_id: targetWh.id },
              create: {
                warehouse_id: targetWh.id,
                dispatch_code: dispCode,
                order_code: ord.order_code,
                item_count: (ord as any).package_count || 3,
                total_weight: ord.total_weight || 15,
                status: OutboundStatus.PICKING,
                picked_by: 'Nguyễn Văn Nam (Thủ kho)',
                notes: `Bốc dỡ xuất bến đơn hàng ${ord.order_code}`,
              },
            });
          } catch {
            // bỏ qua nếu trùng
          }
        }

        dispatches = await this.prisma.outboundDispatch.findMany({
          where: warehouseId ? { warehouse_id: targetWh.id } : {},
          include: {
            warehouse: { select: { id: true, name: true, code: true } },
          },
          orderBy: { created_at: 'desc' },
          take: 20,
        });
      }
    }

    // Lấy thông tin các đơn hàng liên quan
    const orderCodes = dispatches.map((d) => d.order_code).filter(Boolean) as string[];
    const orders = orderCodes.length > 0
      ? await this.prisma.order.findMany({
          where: { order_code: { in: orderCodes } },
          select: {
            id: true,
            order_code: true,
            customer_name: true,
            delivery_address: true,
            package_count: true,
            total_weight: true,
            status: true,
          },
        })
      : [];

    const orderMap = new Map(orders.map((o) => [o.order_code, o]));

    return dispatches.map((d) => {
      const order = d.order_code ? orderMap.get(d.order_code) : null;
      const totalPackages = order?.package_count || d.item_count || 1;
      const orderCode = d.order_code || `VR-ORD-${d.dispatch_code.slice(-4)}`;

      // Khởi tạo danh sách các kiện hàng mong đợi
      const expectedPackages = [];
      for (let i = 1; i <= totalPackages; i++) {
        const pkgCode = `PKG-${orderCode}-${i.toString().padStart(2, '0')}`;
        expectedPackages.push({
          barcode: pkgCode,
          index: i,
          total: totalPackages,
          name: `Kiện hàng #${i}/${totalPackages} - ${order?.customer_name || 'Khách hàng B2B'}`,
          weight: Math.round(((order?.total_weight || d.total_weight || 10) / totalPackages) * 10) / 10,
        });
      }

      // Lấy danh sách mã đã quét từ cache
      let scannedSet = this.scannedDockItems.get(d.dispatch_code);
      if (!scannedSet) {
        scannedSet = new Set<string>();
        // Nếu lệnh đã DISPATCHED hoặc COMPLETED, coi như đã quét đủ
        if (d.status === OutboundStatus.DISPATCHED || d.status === OutboundStatus.COMPLETED) {
          expectedPackages.forEach((p) => scannedSet!.add(p.barcode));
        }
        this.scannedDockItems.set(d.dispatch_code, scannedSet);
      }

      const scannedCount = scannedSet.size;
      const progressPercent = totalPackages > 0 ? Math.round((scannedCount / totalPackages) * 100) : 0;
      const isComplete = scannedCount >= totalPackages || d.status === OutboundStatus.DISPATCHED || d.status === OutboundStatus.COMPLETED;

      return {
        dispatchCode: d.dispatch_code,
        warehouseId: d.warehouse_id,
        warehouseName: d.warehouse.name,
        warehouseCode: d.warehouse.code,
        orderCode: d.order_code || undefined,
        routeCode: d.route_code || undefined,
        customerName: order?.customer_name || 'Đơn hàng vận chuyển',
        deliveryAddress: order?.delivery_address || 'Tuyến giao nội thành',
        status: d.status,
        pickedBy: d.picked_by,
        totalPackages,
        totalWeight: d.total_weight,
        scannedCount,
        progressPercent,
        isComplete,
        expectedPackages: expectedPackages.map((p) => ({
          ...p,
          isScanned: scannedSet!.has(p.barcode),
        })),
        createdAt: d.created_at.toISOString(),
      };
    });
  }

  /**
   * Quét mã kiện hàng tại cổng Dock để bốc lên xe (Dock Scan-to-Dispatch)
   * Kiểm tra nghiêm ngặt chống nhầm chuyến xe/nhầm đơn hàng
   */
  async scanDockItem(dto: ScanDockDto) {
    const dispatch = await this.prisma.outboundDispatch.findUnique({
      where: { dispatch_code: dto.dispatchCode },
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });

    if (!dispatch) {
      return {
        success: false,
        reason: 'DISPATCH_NOT_FOUND',
        barcode: dto.barcode,
        message: `Lệnh xuất kho ${dto.dispatchCode} không tồn tại trong hệ thống!`,
      };
    }

    // Lấy thông tin đơn hàng của lệnh này
    let currentOrder: any = null;
    if (dispatch.order_code) {
      currentOrder = await this.prisma.order.findUnique({
        where: { order_code: dispatch.order_code },
        include: { customer: true },
      });
    }

    const totalPackages = currentOrder?.package_count || dispatch.item_count || 1;
    const orderCode = dispatch.order_code || `VR-ORD-${dispatch.dispatch_code.slice(-4)}`;

    // Tạo tập hợp các mã hợp lệ cho lệnh này
    const validBarcodes = new Set<string>();
    for (let i = 1; i <= totalPackages; i++) {
      validBarcodes.add(`PKG-${orderCode}-${i.toString().padStart(2, '0')}`);
    }
    // Hỗ trợ quét trực tiếp mã đơn hàng
    if (dispatch.order_code) validBarcodes.add(dispatch.order_code);

    const cleanBarcode = dto.barcode.trim().toUpperCase();

    // KIỂM TRA 1: Có đúng mã của lệnh này không?
    if (!validBarcodes.has(cleanBarcode)) {
      // Tìm xem mã này thuộc đơn hàng nào khác trong hệ thống để đưa ra cảnh báo chính xác
      let foundOrderCode: string | null = null;
      let otherDispatchCode: string | null = null;

      // Thử trích xuất mã đơn từ barcode dạng PKG-[ORDER]-XX
      const pkgMatch = cleanBarcode.match(/^PKG-(VR-\d{4}-\d+)-\d+$/);
      if (pkgMatch) {
        foundOrderCode = pkgMatch[1];
      } else {
        const anyOrder = await this.prisma.order.findFirst({
          where: { order_code: cleanBarcode },
        });
        if (anyOrder) foundOrderCode = anyOrder.order_code;
      }

      if (foundOrderCode) {
        const otherDispatch = await this.prisma.outboundDispatch.findFirst({
          where: { order_code: foundOrderCode },
        });
        otherDispatchCode = otherDispatch?.dispatch_code || null;

        return {
          success: false,
          reason: 'WRONG_VEHICLE',
          barcode: cleanBarcode,
          correctOrderCode: foundOrderCode,
          correctDispatchCode: otherDispatchCode,
          message: `🚨 CẢNH BÁO NGUY HIỂM: Kiện hàng thuộc ĐƠN HÀNG [${foundOrderCode}]${otherDispatchCode ? ` (Lệnh xuất ${otherDispatchCode})` : ''}! KHÔNG ĐƯỢC XẾP LÊN XE NÀY!`,
        };
      }

      return {
        success: false,
        reason: 'UNKNOWN_BARCODE',
        barcode: cleanBarcode,
        message: `⚠️ Mã kiện "${cleanBarcode}" không thuộc lệnh xuất kho ${dto.dispatchCode} và không tồn tại trong hệ thống!`,
      };
    }

    // KIỂM TRA 2: Mã này đã được quét trước đó chưa?
    let scannedSet = this.scannedDockItems.get(dto.dispatchCode);
    if (!scannedSet) {
      scannedSet = new Set<string>();
      this.scannedDockItems.set(dto.dispatchCode, scannedSet);
    }

    if (scannedSet.has(cleanBarcode)) {
      return {
        success: false,
        reason: 'ALREADY_SCANNED',
        barcode: cleanBarcode,
        message: `⚠️ Kiện hàng "${cleanBarcode}" ĐÃ ĐƯỢC QUÉT lên xe trước đó rồi! Tránh quét trùng lặp.`,
        scannedCount: scannedSet.size,
        totalCount: totalPackages,
        progressPercent: Math.round((scannedSet.size / totalPackages) * 100),
        isComplete: scannedSet.size >= totalPackages,
      };
    }

    // HỢP LỆ: Ghi nhận kiện hàng đã bốc lên xe!
    scannedSet.add(cleanBarcode);
    const scannedCount = scannedSet.size;
    const progressPercent = Math.min(100, Math.round((scannedCount / totalPackages) * 100));
    const isComplete = scannedCount >= totalPackages;

    // Ghi nhật ký kho Audit Log
    const user = dto.scannedBy || 'Thủ kho quét Dock';
    await this.prisma.warehouseActivity.create({
      data: {
        warehouse_id: dispatch.warehouse_id,
        type: WmsActivityType.OUTBOUND,
        description: `Bốc kiện hàng [${cleanBarcode}] (${scannedCount}/${totalPackages}) lên xe theo lệnh xuất ${dispatch.dispatch_code}`,
        user,
        reference_code: dispatch.dispatch_code,
        quantity: 1,
      },
    });

    // Nếu đã quét đủ 100% kiện: Tự động cập nhật lệnh xuất kho thành DISPATCHED
    if (isComplete && dispatch.status !== OutboundStatus.DISPATCHED && dispatch.status !== OutboundStatus.COMPLETED) {
      await this.prisma.outboundDispatch.update({
        where: { id: dispatch.id },
        data: {
          status: OutboundStatus.DISPATCHED,
          completed_at: new Date(),
        },
      });

      // Nếu đơn hàng đang ở trạng thái CONFIRMED, ASSIGNED hoặc PICKING_UP, chuyển sang IN_TRANSIT
      if (currentOrder && (currentOrder.status === OrderStatus.CONFIRMED || currentOrder.status === OrderStatus.ASSIGNED || currentOrder.status === OrderStatus.PICKING_UP)) {
        await this.prisma.order.update({
          where: { id: currentOrder.id },
          data: { status: OrderStatus.IN_TRANSIT },
        });
      }
    }

    const result = {
      success: true,
      barcode: cleanBarcode,
      dispatchCode: dto.dispatchCode,
      orderCode: dispatch.order_code,
      customerName: currentOrder?.customer?.name || currentOrder?.receiver_name || 'Khách hàng',
      scannedCount,
      totalCount: totalPackages,
      progressPercent,
      isComplete,
      message: isComplete
        ? `🎉 XUẤT SẮC! Đã bốc đủ 100% (${scannedCount}/${totalPackages} kiện) cho lệnh ${dto.dispatchCode}. Chuyến xe đã sẵn sàng xuất bến!`
        : `✅ HỢP LỆ: Kiện hàng [${cleanBarcode}] đã được bốc lên xe thành công! (${scannedCount}/${totalPackages} kiện)`,
    };

    // Phát sóng WebSocket Realtime
    this.realtimeGateway?.emitWmsDockScanned({
      warehouseId: dispatch.warehouse_id,
      dispatchCode: dto.dispatchCode,
      barcode: cleanBarcode,
      success: true,
      itemName: `Kiện ${cleanBarcode} - ${currentOrder?.customer?.name || currentOrder?.receiver_name || 'Khách hàng'}`,
      scannedCount,
      totalCount: totalPackages,
      isComplete,
      scannedBy: user,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Quét nhập kho nhanh và phân bổ kệ (Inbound Putaway Scan)
   */
  async scanInboundItem(dto: ScanInboundDto) {
    const qty = dto.quantity || 1;
    const cleanSku = (dto.sku || dto.barcode).trim().toUpperCase();
    const cleanBarcode = dto.barcode.trim().toUpperCase();
    const productName = dto.productName || `Hàng hóa nhập kho [${cleanSku}]`;
    const user = dto.scannedBy || 'Thủ kho Check-in';

    // Tìm xem SKU đã có trong kho chưa
    let item = await this.prisma.inventoryItem.findFirst({
      where: {
        warehouse_id: dto.warehouseId,
        sku: cleanSku,
      },
    });

    let newTotalQuantity = qty;

    if (item) {
      item = await this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity + qty,
          zone_code: dto.zoneCode || item.zone_code,
          last_updated: new Date(),
        },
      });
      newTotalQuantity = item.quantity;
    } else {
      item = await this.prisma.inventoryItem.create({
        data: {
          warehouse_id: dto.warehouseId,
          sku: cleanSku,
          product_name: productName,
          zone_code: dto.zoneCode || 'Z-GEN-01',
          quantity: qty,
          unit: dto.unit || 'kiện',
          weight_per_unit: dto.weightPerUnit || 1.0,
          min_stock_level: 10,
        },
      });
      newTotalQuantity = item.quantity;
    }

    // Ghi nhật ký kho Audit Log
    await this.prisma.warehouseActivity.create({
      data: {
        warehouse_id: dto.warehouseId,
        type: WmsActivityType.INBOUND,
        description: `Quét nhập kho ${qty} ${item.unit} [${cleanSku}] vào phân khu ${dto.zoneCode}`,
        user,
        reference_code: dto.receiptCode || cleanBarcode,
        quantity: qty,
      },
    });

    // Phát sóng WebSocket Realtime
    this.realtimeGateway?.emitWmsInboundScanned({
      warehouseId: dto.warehouseId,
      barcode: cleanBarcode,
      sku: cleanSku,
      productName: item.product_name,
      zoneCode: dto.zoneCode,
      quantity: qty,
      newTotalQuantity,
      scannedBy: user,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      barcode: cleanBarcode,
      sku: cleanSku,
      productName: item.product_name,
      zoneCode: dto.zoneCode,
      quantityAdded: qty,
      newTotalQuantity,
      unit: item.unit,
      message: `✅ Nhập kho thành công: +${qty} ${item.unit} [${item.product_name}] lưu vào kệ ${dto.zoneCode} (Tổng tồn: ${newTotalQuantity})`,
    };
  }

  /**
   * Tra cứu nhanh tức thời thông tin mã vạch / QR (Quick Barcode Lookup)
   */
  async lookupBarcode(barcode: string, warehouseId?: string) {
    const clean = barcode.trim().toUpperCase();

    // 1. Thử tìm trong Tồn kho InventoryItem theo SKU
    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: {
        sku: clean,
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
      },
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });

    if (inventoryItem) {
      return {
        found: true,
        type: 'INVENTORY_SKU',
        barcode: clean,
        title: inventoryItem.product_name,
        code: inventoryItem.sku,
        warehouseName: inventoryItem.warehouse.name,
        zoneCode: inventoryItem.zone_code,
        quantity: inventoryItem.quantity,
        unit: inventoryItem.unit,
        weightPerUnit: inventoryItem.weight_per_unit,
        status: inventoryItem.quantity > inventoryItem.min_stock_level ? 'IN_STOCK' : 'LOW_STOCK',
        details: {
          minStockLevel: inventoryItem.min_stock_level,
          lastUpdated: inventoryItem.last_updated.toISOString(),
        },
      };
    }

    // 2. Thử tìm trong Đơn hàng theo mã vận đơn
    let orderCode = clean;
    const pkgMatch = clean.match(/^PKG-(VR-\d{4}-\d+)-\d+$/);
    if (pkgMatch) {
      orderCode = pkgMatch[1];
    }

    const order = await this.prisma.order.findFirst({
      where: { order_code: orderCode },
      include: {
        customer: { select: { name: true } },
        deliveries: { select: { id: true, delivery_code: true, status: true } },
      },
    });

    if (order) {
      // Tìm lệnh xuất kho liên quan nếu có
      const dispatch = await this.prisma.outboundDispatch.findFirst({
        where: { order_code: order.order_code },
        include: { warehouse: { select: { name: true } } },
      });

      return {
        found: true,
        type: 'ORDER_PACKAGE',
        barcode: clean,
        title: `Vận đơn ${order.order_code} - ${order.customer?.name || order.receiver_name}`,
        code: order.order_code,
        warehouseName: dispatch?.warehouse.name || 'Kho trung tâm',
        status: order.status,
        quantity: (order as any).package_count || 1,
        unit: 'kiện',
        weight: order.total_weight,
        details: {
          customerName: order.customer?.name || order.receiver_name,
          deliveryAddress: order.receiver_address,
          dispatchCode: dispatch?.dispatch_code || 'Chưa xếp lệnh xuất',
          dispatchStatus: dispatch?.status || 'PENDING',
        },
      };
    }

    // 3. Thử tìm theo Lệnh xuất kho OutboundDispatch
    const dispatch = await this.prisma.outboundDispatch.findUnique({
      where: { dispatch_code: clean },
      include: { warehouse: { select: { name: true } } },
    });

    if (dispatch) {
      return {
        found: true,
        type: 'OUTBOUND_DISPATCH',
        barcode: clean,
        title: `Lệnh xuất kho ${dispatch.dispatch_code}`,
        code: dispatch.dispatch_code,
        warehouseName: dispatch.warehouse.name,
        status: dispatch.status,
        quantity: dispatch.item_count,
        unit: 'kiện',
        weight: dispatch.total_weight,
        details: {
          orderCode: dispatch.order_code,
          routeCode: dispatch.route_code,
          pickedBy: dispatch.picked_by,
          createdAt: dispatch.created_at.toISOString(),
        },
      };
    }

    return {
      found: false,
      barcode: clean,
      message: `Không tìm thấy thông tin nào liên quan đến mã "${clean}".`,
    };
  }
}
