import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VehicleStatus, MeterType } from '@prisma/client';

export interface CreateVehicleDto {
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  meterType: MeterType;
  currentMeter: number;
  chassisNumber?: string;
  engineNumber?: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  insuranceExpiryDate?: string;
  fuelType?: string;
  assignedDepartment?: string;
  notes?: string;
}

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm araçları listeler ve Muayene Kilidi durumunu dinamik kontrol eder.
   */
  async findAll(tenantId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId },
      include: {
        zimmets: {
          where: { status: 'ACTIVE' },
          include: { driver: { select: { firstName: true, lastName: true, phone: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Dinamik Muayene Kilidi Kontrolü:
    // Eğer yasal muayene tarihi geçmişse ve durumu INSPECTION_EXPIRED değilse otomatik güncelle
    return vehicles.map((v) => {
      const isExpired = v.nextInspectionDate && new Date(v.nextInspectionDate) < now;
      const effectiveStatus = isExpired ? VehicleStatus.INSPECTION_EXPIRED : v.status;
      return {
        ...v,
        status: effectiveStatus,
        isInspectionLocked: isExpired,
        activeZimmet: v.zimmets.length > 0 ? v.zimmets[0] : null,
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: {
        zimmets: {
          orderBy: { assignedAt: 'desc' },
          take: 5,
          include: { driver: true },
        },
        issueReports: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { usedParts: { include: { sparePart: true } } },
        },
      },
    });

    if (!vehicle) throw new NotFoundException('Araç veya iş makinesi bulunamadı.');

    const isExpired = vehicle.nextInspectionDate && new Date(vehicle.nextInspectionDate) < new Date();

    return {
      ...vehicle,
      isInspectionLocked: isExpired,
      status: isExpired ? VehicleStatus.INSPECTION_EXPIRED : vehicle.status,
    };
  }

  /**
   * QR Kod token'ına göre araç sorgulama (Mobil kabin okuyucu için)
   */
  async findByQrToken(qrToken: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { qrCodeToken: qrToken },
      include: {
        zimmets: {
          where: { status: 'ACTIVE' },
          include: { driver: true },
        },
      },
    });

    if (!vehicle) throw new NotFoundException('Geçersiz araç QR kodu!');

    const isExpired = vehicle.nextInspectionDate && new Date(vehicle.nextInspectionDate) < new Date();

    return {
      ...vehicle,
      isInspectionLocked: isExpired,
      status: isExpired ? VehicleStatus.INSPECTION_EXPIRED : vehicle.status,
    };
  }

  async create(tenantId: string, dto: CreateVehicleDto) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { tenantId, plateNumber: dto.plateNumber },
    });

    if (existing) throw new BadRequestException('Bu plaka / araç kodu ile kayıtlı araç zaten mevcut.');

    return this.prisma.vehicle.create({
      data: {
        tenantId,
        plateNumber: dto.plateNumber,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        category: dto.category,
        meterType: dto.meterType || MeterType.KM,
        currentMeter: dto.currentMeter || 0,
        chassisNumber: dto.chassisNumber,
        engineNumber: dto.engineNumber,
        lastInspectionDate: dto.lastInspectionDate ? new Date(dto.lastInspectionDate) : null,
        nextInspectionDate: dto.nextInspectionDate ? new Date(dto.nextInspectionDate) : null,
        insuranceExpiryDate: dto.insuranceExpiryDate ? new Date(dto.insuranceExpiryDate) : null,
        fuelType: dto.fuelType,
        assignedDepartment: dto.assignedDepartment,
        notes: dto.notes,
        status: VehicleStatus.AVAILABLE,
      },
    });
  }

  async updateMeter(tenantId: string, id: string, newMeter: number) {
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id, tenantId } });
    if (!vehicle) throw new NotFoundException('Araç bulunamadı.');

    if (newMeter < vehicle.currentMeter) {
      throw new BadRequestException('Yeni sayaç değeri (KM/Saat) mevcut değerden daha düşük olamaz.');
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { currentMeter: newMeter },
    });
  }
}
