import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VehicleStatus, ZimmetStatus } from '@prisma/client';

export interface AssignZimmetDto {
  vehicleId: string;
  driverId: string;
  startingMeter?: number;
  qrScanVerified?: boolean;
  checkoutNotes?: string;
  driverSignatureUrl?: string;
}

export interface ReturnZimmetDto {
  zimmetId: string;
  returnMeter: number;
  returnNotes?: string;
  returnStatusCheck?: string;
}

@Injectable()
export class ZimmetService {
  constructor(private prisma: PrismaService) {}

  /**
   * Aktif ve geçmiş tüm zimmet kayıtlarını listeler
   */
  async findAll(tenantId: string) {
    return this.prisma.zimmet.findMany({
      where: { tenantId },
      include: {
        vehicle: true,
        driver: { select: { id: true, firstName: true, lastName: true, phone: true } },
        assignedByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  /**
   * Sürücüye Araç Teslimi (QR Kod Doğrulamalı ve Muayene Kilitli)
   */
  async assign(tenantId: string, assignedByUserId: string, dto: AssignZimmetDto) {
    // 1. Aracı kontrol et
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId },
    });

    if (!vehicle) throw new NotFoundException('Zimmetlenecek araç bulunamadı.');

    // 2. 🚨 PROFESYONEL İŞ KURALI: MUAYENE KİLİDİ
    // Yasal süresi geçen araç "Göreve Uygun Değil / INSPECTION_EXPIRED" statüsüne alınır ve zimmetlenemez!
    const now = new Date();
    const isExpired = vehicle.nextInspectionDate && new Date(vehicle.nextInspectionDate) < now;

    if (isExpired || vehicle.status === VehicleStatus.INSPECTION_EXPIRED) {
      // Araç durumunu güncelle
      await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { status: VehicleStatus.INSPECTION_EXPIRED },
      });

      throw new ForbiddenException(
        `🚨 MUAYENE KİLİDİ DEVREDE! ${vehicle.plateNumber} plakalı aracın zorunlu muayene tarihi (${vehicle.nextInspectionDate ? new Date(vehicle.nextInspectionDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}) dolmuştur. Yasal olarak göreve çıkamaz ve zimmetlenemez!`,
      );
    }

    if (vehicle.status === VehicleStatus.ASSIGNED) {
      throw new BadRequestException('Bu araç şu anda başka bir sürücüye zimmetlidir. Önce mevcut zimmet sonlandırılmalıdır.');
    }

    if (vehicle.status === VehicleStatus.UNDER_MAINTENANCE || vehicle.status === VehicleStatus.OUT_OF_SERVICE) {
      throw new BadRequestException(`Araç serviste veya gayrifaal durumda (${vehicle.status}) olduğu için teslim edilemez.`);
    }

    const startingMeter = dto.startingMeter !== undefined ? dto.startingMeter : vehicle.currentMeter;

    // 3. Zimmet kaydı oluştur
    const zimmet = await this.prisma.zimmet.create({
      data: {
        tenantId,
        vehicleId: vehicle.id,
        driverId: dto.driverId,
        assignedByUserId,
        startingMeter,
        qrScanVerified: dto.qrScanVerified ?? true,
        checkoutNotes: dto.checkoutNotes,
        driverSignatureUrl: dto.driverSignatureUrl,
        status: ZimmetStatus.ACTIVE,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // 4. Araç statüsünü ASSIGNED yap ve sayacını senkronize et
    await this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        status: VehicleStatus.ASSIGNED,
        currentMeter: startingMeter,
      },
    });

    return zimmet;
  }

  /**
   * Aracı Zimmetten İade Alma / Teslim Bırakma
   */
  async returnZimmet(tenantId: string, dto: ReturnZimmetDto) {
    const zimmet = await this.prisma.zimmet.findFirst({
      where: { id: dto.zimmetId, tenantId },
      include: { vehicle: true },
    });

    if (!zimmet) throw new NotFoundException('Zimmet kaydı bulunamadı.');
    if (zimmet.status !== ZimmetStatus.ACTIVE) {
      throw new BadRequestException('Bu zimmet kaydı zaten kapatılmış.');
    }

    if (dto.returnMeter < zimmet.startingMeter) {
      throw new BadRequestException(
        `Dönüş sayacı (${dto.returnMeter}), çıkış sayacından (${zimmet.startingMeter}) küçük olamaz!`,
      );
    }

    const updatedZimmet = await this.prisma.zimmet.update({
      where: { id: zimmet.id },
      data: {
        returnMeter: dto.returnMeter,
        returnedAt: new Date(),
        status: ZimmetStatus.RETURNED,
        returnNotes: dto.returnNotes,
        returnStatusCheck: dto.returnStatusCheck,
      },
      include: { vehicle: true, driver: true },
    });

    // Araç statüsünü boşa çıkar ve sayacını güncelle
    await this.prisma.vehicle.update({
      where: { id: zimmet.vehicleId },
      data: {
        status: VehicleStatus.AVAILABLE,
        currentMeter: dto.returnMeter,
      },
    });

    return updatedZimmet;
  }
}
