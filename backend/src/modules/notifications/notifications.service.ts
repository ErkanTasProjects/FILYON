import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Her gün sabah 08:00'de çalışan otomatik Muayene ve Periyodik Bakım Tarama Cron Görevi
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleInspectionAndMaintenanceCron() {
    this.logger.log('🔔 Günlük Muayene ve Yasal Süre Tarama Görevi Başlatıldı...');

    const now = new Date();
    const fifteenDaysLater = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    // 1. Muayene süresi geçmiş araçları tespit et ve otomatik Muayene Kilidi koy
    const expiredVehicles = await this.prisma.vehicle.findMany({
      where: {
        nextInspectionDate: { lt: now },
        status: { not: VehicleStatus.INSPECTION_EXPIRED },
      },
    });

    for (const v of expiredVehicles) {
      await this.prisma.vehicle.update({
        where: { id: v.id },
        data: { status: VehicleStatus.INSPECTION_EXPIRED },
      });

      this.logger.warn(`🚨 [MUAYENE KİLİDİ AKTİF EDİLDİ] ${v.plateNumber} plakalı aracın muayenesi geçti!`);
    }

    // 2. Muayenesi 15 günden az kalan araçlar için yöneticilere bildirim üret
    const upcomingVehicles = await this.prisma.vehicle.findMany({
      where: {
        nextInspectionDate: {
          gte: now,
          lte: fifteenDaysLater,
        },
      },
      include: { tenant: { include: { users: { where: { role: 'MANAGER' } } } } },
    });

    for (const v of upcomingVehicles) {
      const daysLeft = Math.ceil((new Date(v.nextInspectionDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      for (const manager of v.tenant.users) {
        await this.prisma.notification.create({
          data: {
            tenantId: v.tenantId,
            userId: manager.id,
            title: `⚠️ Muayene Yaklaşıyor: ${v.plateNumber}`,
            message: `${v.plateNumber} plakalı ${v.brand} ${v.model} aracın yasal muayenesine ${daysLeft} gün kaldı. Lütfen randevu alınız.`,
            type: 'INSPECTION_ALERT',
            linkUrl: `/vehicles/${v.id}`,
          },
        });
      }
    }

    this.logger.log(`✅ Muayene taraması tamamlandı. (${expiredVehicles.length} kilitlendi, ${upcomingVehicles.length} yaklaşıyor).`);
  }

  async getUserNotifications(tenantId: string, userId: string) {
    return this.prisma.notification.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(tenantId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, tenantId },
      data: { isRead: true },
    });
  }
}
