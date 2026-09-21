import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { CustomerType } from '@prisma/client';

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: CustomerFilterParams) {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.type && params.type !== 'ALL') {
      where.type = params.type as CustomerType;
    }

    if (params?.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { tax_code: { contains: q } },
      ];
    }

    const [total, customers] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          addresses: true,
          pricing_rules: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
    ]);

    // Format theo response enriched cho frontend
    const enriched = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address,
      latitude: c.latitude,
      longitude: c.longitude,
      type: c.type,
      tier: c.tier,
      taxCode: c.tax_code || undefined,
      contactPerson: c.contact_person || undefined,
      website: c.website || undefined,
      notes: c.notes || undefined,
      addresses: c.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        city: a.city || 'Việt Nam',
        latitude: a.latitude,
        longitude: a.longitude,
        isDefault: a.is_default,
        contactName: a.contact_name || c.name,
        contactPhone: a.contact_phone || c.phone,
      })),
      contractPricing: c.pricing_rules.map((p) => ({
        id: p.id,
        routeType: p.route_type,
        pricePerKm: p.price_per_km,
        pricePerKg: p.price_per_kg,
        discountPercent: p.discount_percent,
      })),
      stats: {
        totalOrders: c._count.orders,
        totalRevenue: c._count.orders * 2500000,
        activeOrders: 1,
        completedOrders: c._count.orders,
        avgOrderValue: 2500000,
      },
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at.toISOString(),
    }));

    return {
      items: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        pricing_rules: true,
        orders: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng ID: ${id}`);
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        type: dto.type || CustomerType.INDIVIDUAL,
        tier: dto.tier,
        tax_code: dto.tax_code,
        contact_person: dto.contact_person,
        website: dto.website,
        notes: dto.notes,
        addresses: {
          create: {
            label: dto.type === 'ENTERPRISE' ? 'Trụ sở chính' : 'Địa chỉ giao hàng',
            address: dto.address,
            city: dto.address.split(',').pop()?.trim() || 'Việt Nam',
            latitude: dto.latitude,
            longitude: dto.longitude,
            is_default: true,
            contact_name: dto.contact_person || dto.name,
            contact_phone: dto.phone,
          },
        },
      },
      include: {
        addresses: true,
        pricing_rules: true,
      },
    });

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
      include: {
        addresses: true,
        pricing_rules: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    return { success: true, message: 'Đã xóa khách hàng thành công' };
  }
}
