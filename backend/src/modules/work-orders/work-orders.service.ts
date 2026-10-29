import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkOrderStatus, ScrapStatus, IssuePriority, VehicleStatus, PartTransactionType } from '@prisma/client';

export interface CreateWorkOrderDto {
  vehicleId: string;
  issueReportId?: string;
  assignedMechanicId?: string;
  title: string;
  description: string;
  priority?: IssuePriority;
  laborHourlyRate?: number;
}

export interface AddPartToWorkOrderDto {
  sparePartId: string;
  quantity: number;
}

export interface UploadScrapPhotoDto {
  sparePartId: string;
  scrapPhotoUrl: string;
  notes?: string;
}

export interface CompleteWorkOrderDto {
  laborHours: number;
  completionNotes?: string;
}

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * İş emirlerini filtreli ve detaylı listele
   */
  async findAll(tenantId: string) {
    return this.prisma.workOrder.findMany({
      where: { tenantId },
      include: {
        vehicle: true,
        chief: { select: { firstName: true, lastName: true } },
        assignedMechanic: { select: { id: true, firstName: true, lastName: true } },
        usedParts: { include: { sparePart: true } },
        scrapRecords: {
          include: {
            sparePart: true,
            warehouseStaff: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
      include: {
        vehicle: true,
        chief: { select: { firstName: true, lastName: true, phone: true } },
        assignedMechanic: { select: { id: true, firstName: true, lastName: true, phone: true } },
        issueReport: true,
        usedParts: { include: { sparePart: true } },
        scrapRecords: {
          include: {
            sparePart: true,
            warehouseStaff: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!workOrder) throw new NotFoundException('İş emri bulunamadı.');
    return workOrder;
  }

  /**
   * Atölye Şefi tarafından yeni iş emri açılması
   */
  async create(tenantId: string, chiefId: string, dto: CreateWorkOrderDto) {
    const count = await this.prisma.workOrder.count({ where: { tenantId } });
    const workOrderNumber = `WO-2026-${String(count + 1).padStart(5, '0')}`;

    const workOrder = await this.prisma.workOrder.create({
      data: {
        tenantId,
        workOrderNumber,
        vehicleId: dto.vehicleId,
        chiefId,
        assignedMechanicId: dto.assignedMechanicId,
        issueReportId: dto.issueReportId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || IssuePriority.MEDIUM,
        status: WorkOrderStatus.ASSIGNED,
        startedAt: new Date(),
        laborHourlyRate: dto.laborHourlyRate || 600.0,
      },
      include: { vehicle: true },
    });

    // Araç durumunu atölyede (UNDER_MAINTENANCE) olarak işaretle
    await this.prisma.vehicle.update({
      where: { id: dto.vehicleId },
      data: { status: VehicleStatus.UNDER_MAINTENANCE },
    });

    return workOrder;
  }

  /**
   * İş emrine ambardan yedek parça tahsis edilmesi
   */
  async addPart(tenantId: string, workOrderId: string, userId: string, dto: AddPartToWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
    });
    if (!workOrder) throw new NotFoundException('İş emri bulunamadı.');

    const part = await this.prisma.sparePart.findFirst({
      where: { id: dto.sparePartId, tenantId },
    });
    if (!part) throw new NotFoundException('Yedek parça bulunamadı.');

    if (part.stockQuantity < dto.quantity) {
      throw new BadRequestException(`Yetersiz stok! Mevcut Stok: ${part.stockQuantity} ${part.unit}`);
    }

    const totalPrice = part.unitPrice * dto.quantity;

    // 1. İş emrine parça kaydı ekle
    const workOrderPart = await this.prisma.workOrderPart.create({
      data: {
        tenantId,
        workOrderId,
        sparePartId: part.id,
        quantity: dto.quantity,
        unitPrice: part.unitPrice,
        totalPrice,
      },
    });

    // 2. Ambar stok düşüşü ve stok hareketi oluştur
    const newStock = part.stockQuantity - dto.quantity;
    await this.prisma.sparePart.update({
      where: { id: part.id },
      data: { stockQuantity: newStock },
    });

    await this.prisma.partTransaction.create({
      data: {
        tenantId,
        sparePartId: part.id,
        workOrderId,
        type: PartTransactionType.STOCK_OUT_WORK_ORDER,
        quantity: dto.quantity,
        previousStock: part.stockQuantity,
        newStock,
        performedByUserId: userId,
        referenceDocNo: workOrder.workOrderNumber,
        notes: `${workOrder.workOrderNumber} numaralı iş emrine parça çıkışı yapıldı.`,
      },
    });

    // 3. İş emri maliyetini ve durumunu güncelle (Hurda Kilidi uyarısı için)
    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        partsCost: { increment: totalPrice },
        totalCost: { increment: totalPrice },
        status: WorkOrderStatus.WAITING_SCRAP_CONFIRMATION,
      },
    });

    return workOrderPart;
  }

  /**
   * Usta tarafından sökülen eski (hurda) parça fotoğrafının yüklenmesi
   */
  async uploadScrapPhoto(tenantId: string, workOrderId: string, dto: UploadScrapPhotoDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
    });
    if (!workOrder) throw new NotFoundException('İş emri bulunamadı.');

    return this.prisma.scrapRecord.create({
      data: {
        tenantId,
        workOrderId,
        sparePartId: dto.sparePartId,
        scrapPhotoUrl: dto.scrapPhotoUrl,
        warehouseNotes: dto.notes,
        status: ScrapStatus.PENDING_WAREHOUSE_APPROVAL,
      },
    });
  }

  /**
   * Ambar Yetkilisi tarafından hurda parçanın teslim alınıp onaylanması
   */
  async approveScrapRecord(tenantId: string, scrapRecordId: string, warehouseStaffId: string, approved: boolean, notes?: string) {
    const scrap = await this.prisma.scrapRecord.findFirst({
      where: { id: scrapRecordId, tenantId },
    });
    if (!scrap) throw new NotFoundException('Hurda kaydı bulunamadı.');

    return this.prisma.scrapRecord.update({
      where: { id: scrapRecordId },
      data: {
        status: approved ? ScrapStatus.APPROVED : ScrapStatus.REJECTED,
        warehouseStaffId,
        approvedAt: approved ? new Date() : null,
        warehouseNotes: notes,
      },
    });
  }

  /**
   * 🚨 PROFESYONEL İŞ KURALI: SAYIŞTAY VE İÇ DENETİM HURDA KİLİDİ
   * Usta bir iş emrinde yeni parça kullandığında, çıkan eski (hurda) parçanın fotoğrafını
   * sisteme yüklemeden ve ambar teslimini onaylatmadan iş emrini kapatamaz!
   */
  async completeWorkOrder(tenantId: string, workOrderId: string, dto: CompleteWorkOrderDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
      include: {
        usedParts: true,
        scrapRecords: true,
      },
    });

    if (!workOrder) throw new NotFoundException('İş emri bulunamadı.');

    // 🔒 HURDA KİLİDİ KONTROLÜ
    if (workOrder.usedParts.length > 0) {
      for (const usedPart of workOrder.usedParts) {
        const approvedScrap = workOrder.scrapRecords.find(
          (s) => s.sparePartId === usedPart.sparePartId && s.status === ScrapStatus.APPROVED,
        );

        if (!approvedScrap) {
          throw new ForbiddenException(
            `🚨 SAYIŞTAY HURDA KİLİDİ DEVREDE! Bu iş emrinde yeni yedek parça kullanılmıştır. ` +
            `Sökülen eski hurda parçanın net fotoğrafı yüklenmeden ve Ambar Sorumlusu tarafından ` +
            `fiziksel teslimatı sistemde onaylanmadan bu iş emri kesinlikle kapatılamaz!`,
          );
        }
      }
    }

    const laborCost = (dto.laborHours || 0) * (workOrder.laborHourlyRate || 600);
    const totalCost = laborCost + workOrder.partsCost + workOrder.externalServiceCost;

    // İş emrini kapat
    const completed = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.COMPLETED,
        laborHours: dto.laborHours,
        laborCost,
        totalCost,
        completedAt: new Date(),
        completionNotes: dto.completionNotes,
      },
      include: { vehicle: true },
    });

    // Araç durumunu tekrar göreve hazır (AVAILABLE) yap
    await this.prisma.vehicle.update({
      where: { id: workOrder.vehicleId },
      data: {
        status: VehicleStatus.AVAILABLE,
        lastMaintenanceDate: new Date(),
      },
    });

    // Varsa bağlı arıza bildirimini çözüldü yap
    if (workOrder.issueReportId) {
      await this.prisma.issueReport.update({
        where: { id: workOrder.issueReportId },
        data: { status: 'RESOLVED' },
      });
    }

    return completed;
  }
}
