import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VehicleStatus, WorkOrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Yönetici Paneli Canlı KPI ve Grafik İstatistikleri
   */
  async getDashboardSummary(tenantId: string) {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalVehicles,
      assignedVehicles,
      maintenanceVehicles,
      expiredInspectionVehicles,
      activeWorkOrders,
      waitingScrapOrders,
      criticalStockCount,
      upcomingInspections,
      totalCostAgg,
    ] = await Promise.all([
      this.prisma.vehicle.count({ where: { tenantId } }),
      this.prisma.vehicle.count({ where: { tenantId, status: VehicleStatus.ASSIGNED } }),
      this.prisma.vehicle.count({ where: { tenantId, status: VehicleStatus.UNDER_MAINTENANCE } }),
      this.prisma.vehicle.count({
        where: {
          tenantId,
          OR: [
            { status: VehicleStatus.INSPECTION_EXPIRED },
            { nextInspectionDate: { lt: now } },
          ],
        },
      }),
      this.prisma.workOrder.count({
        where: {
          tenantId,
          status: { in: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.WAITING_SCRAP_CONFIRMATION] },
        },
      }),
      this.prisma.workOrder.count({
        where: { tenantId, status: WorkOrderStatus.WAITING_SCRAP_CONFIRMATION },
      }),
      this.prisma.sparePart.count({
        where: {
          tenantId,
          stockQuantity: { lte: this.prisma.sparePart.fields.minStockLevel },
        },
      }),
      this.prisma.vehicle.findMany({
        where: {
          tenantId,
          nextInspectionDate: {
            gte: now,
            lte: thirtyDaysLater,
          },
        },
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          nextInspectionDate: true,
          assignedDepartment: true,
        },
        orderBy: { nextInspectionDate: 'asc' },
        take: 5,
      }),
      this.prisma.workOrder.aggregate({
        where: { tenantId, status: WorkOrderStatus.COMPLETED },
        _sum: {
          laborCost: true,
          partsCost: true,
          totalCost: true,
        },
      }),
    ]);

    const activeFleetRate = totalVehicles > 0 ? Math.round((assignedVehicles / totalVehicles) * 100) : 0;

    return {
      kpi: {
        totalVehicles,
        assignedVehicles,
        maintenanceVehicles,
        expiredInspectionVehicles,
        activeWorkOrders,
        waitingScrapOrders, // Sayıştay hurda kilidinde bekleyenler
        criticalStockCount,
        fleetReadinessRate: `${activeFleetRate}%`,
        totalMaintenanceSpend: totalCostAgg._sum.totalCost || 0,
        partsCostSpend: totalCostAgg._sum.partsCost || 0,
        laborCostSpend: totalCostAgg._sum.laborCost || 0,
      },
      upcomingInspections,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sayıştay ve İç Denetim Uyumlu Araç Başına Maliyet ve Parça Analiz Raporu
   */
  async getAuditCostReport(tenantId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId },
      include: {
        workOrders: {
          where: { status: WorkOrderStatus.COMPLETED },
          include: {
            usedParts: { include: { sparePart: true } },
            scrapRecords: true,
          },
        },
      },
      orderBy: { plateNumber: 'asc' },
    });

    return vehicles.map((v) => {
      let totalPartsSpend = 0;
      let totalLaborSpend = 0;
      let totalWorkOrderCount = v.workOrders.length;
      let replacedPartsCount = 0;
      let verifiedScrapCount = 0;

      for (const wo of v.workOrders) {
        totalPartsSpend += wo.partsCost;
        totalLaborSpend += wo.laborCost;
        replacedPartsCount += wo.usedParts.length;
        verifiedScrapCount += wo.scrapRecords.filter((s) => s.status === 'APPROVED').length;
      }

      const totalCost = totalPartsSpend + totalLaborSpend;
      const meter = v.currentMeter > 0 ? v.currentMeter : 1;
      const costPerUnit = Number((totalCost / meter).toFixed(2));

      return {
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        brandModel: `${v.brand} ${v.model}`,
        meterType: v.meterType,
        currentMeter: v.currentMeter,
        totalWorkOrderCount,
        totalPartsSpend,
        totalLaborSpend,
        totalCost,
        costPerUnit: `${costPerUnit} ₺ / ${v.meterType}`,
        replacedPartsCount,
        verifiedScrapCount,
        sayistayAuditCompliance: replacedPartsCount === verifiedScrapCount ? 'TAM UYUMLU (%100)' : 'EKSİK HURDA ONAYI VAR',
      };
    });
  }
}
