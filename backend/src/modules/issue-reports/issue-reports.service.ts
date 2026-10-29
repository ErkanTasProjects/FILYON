import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IssuePriority, IssueStatus } from '@prisma/client';

export interface CreateIssueReportDto {
  vehicleId: string;
  title: string;
  description: string;
  priority?: IssuePriority;
  photoUrls?: string[];
  audioRecordingUrl?: string;
  voiceTranscript?: string;
  latitude?: number;
  longitude?: number;
  offlineId?: string;
}

@Injectable()
export class IssueReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.issueReport.findMany({
      where: { tenantId },
      include: {
        vehicle: true,
        driver: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const report = await this.prisma.issueReport.findFirst({
      where: { id, tenantId },
      include: {
        vehicle: true,
        driver: { select: { firstName: true, lastName: true, phone: true } },
        workOrders: true,
      },
    });

    if (!report) throw new NotFoundException('Arıza bildirimi bulunamadı.');
    return report;
  }

  async create(tenantId: string, driverId: string, dto: CreateIssueReportDto) {
    return this.prisma.issueReport.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        driverId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || IssuePriority.MEDIUM,
        photoUrls: dto.photoUrls || [],
        audioRecordingUrl: dto.audioRecordingUrl,
        voiceTranscript: dto.voiceTranscript,
        latitude: dto.latitude,
        longitude: dto.longitude,
        offlineId: dto.offlineId,
        syncedAt: new Date(),
        status: IssueStatus.REPORTED,
      },
      include: { vehicle: true },
    });
  }

  /**
   * Saha Mobil Uygulaması için Çevrimdışı (Offline-First) Toplu Senkronizasyon
   */
  async syncOfflineBatch(tenantId: string, driverId: string, reports: CreateIssueReportDto[]) {
    const results = [];
    for (const r of reports) {
      // Çift aktarımı önlemek için offlineId kontrolü
      if (r.offlineId) {
        const existing = await this.prisma.issueReport.findFirst({
          where: { tenantId, offlineId: r.offlineId },
        });
        if (existing) {
          results.push(existing);
          continue;
        }
      }

      const created = await this.create(tenantId, driverId, r);
      results.push(created);
    }
    return {
      message: 'Çevrimdışı kayıtlar başarıyla sunucuya aktarıldı.',
      syncedCount: results.length,
      reports: results,
    };
  }
}
