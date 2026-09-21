import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInboundDto } from './dto/create-inbound.dto.js';
import { CreateOutboundDto } from './dto/create-outbound.dto.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { InboundStatus, OutboundStatus, TransferStatus, WmsActivityType } from '@prisma/client';

@Injectable()
export class WmsService {
  constructor(private prisma: PrismaService) {}

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
}
