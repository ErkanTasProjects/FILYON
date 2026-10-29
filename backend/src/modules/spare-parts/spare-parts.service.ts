import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PartTransactionType } from '@prisma/client';

export interface CreateSparePartDto {
  partCode: string;
  oemCode?: string;
  name: string;
  category: string;
  unit?: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel?: number;
  shelfLocation?: string;
  barcode?: string;
  compatibleVehicles?: string;
}

export interface StockInDto {
  quantity: number;
  unitPrice?: number;
  referenceDocNo?: string;
  notes?: string;
}

@Injectable()
export class SparePartsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const parts = await this.prisma.sparePart.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return parts.map((p) => ({
      ...p,
      isCriticalStock: p.stockQuantity <= p.minStockLevel,
    }));
  }

  async findOne(tenantId: string, id: string) {
    const part = await this.prisma.sparePart.findFirst({
      where: { id, tenantId },
      include: {
        partTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { performedByUser: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!part) throw new NotFoundException('Yedek parça bulunamadı.');

    return {
      ...part,
      isCriticalStock: part.stockQuantity <= part.minStockLevel,
    };
  }

  async findByBarcode(tenantId: string, barcode: string) {
    const part = await this.prisma.sparePart.findFirst({
      where: { tenantId, barcode },
    });
    if (!part) throw new NotFoundException('Barkod ile eşleşen yedek parça bulunamadı.');
    return part;
  }

  async create(tenantId: string, dto: CreateSparePartDto) {
    const existing = await this.prisma.sparePart.findFirst({
      where: { tenantId, partCode: dto.partCode },
    });
    if (existing) throw new BadRequestException('Bu parça kodu ile kayıtlı kart zaten var.');

    return this.prisma.sparePart.create({
      data: {
        tenantId,
        partCode: dto.partCode,
        oemCode: dto.oemCode,
        name: dto.name,
        category: dto.category,
        unit: dto.unit || 'ADET',
        unitPrice: dto.unitPrice,
        stockQuantity: dto.stockQuantity,
        minStockLevel: dto.minStockLevel ?? 5,
        shelfLocation: dto.shelfLocation,
        barcode: dto.barcode,
        compatibleVehicles: dto.compatibleVehicles,
      },
    });
  }

  async stockIn(tenantId: string, id: string, userId: string, dto: StockInDto) {
    const part = await this.prisma.sparePart.findFirst({ where: { id, tenantId } });
    if (!part) throw new NotFoundException('Parça bulunamadı.');

    const newStock = part.stockQuantity + dto.quantity;

    await this.prisma.partTransaction.create({
      data: {
        tenantId,
        sparePartId: part.id,
        type: PartTransactionType.STOCK_IN,
        quantity: dto.quantity,
        previousStock: part.stockQuantity,
        newStock,
        performedByUserId: userId,
        referenceDocNo: dto.referenceDocNo,
        notes: dto.notes || 'Satın alma / İkmal ambar girişi',
      },
    });

    return this.prisma.sparePart.update({
      where: { id: part.id },
      data: {
        stockQuantity: newStock,
        ...(dto.unitPrice ? { unitPrice: dto.unitPrice } : {}),
      },
    });
  }
}
