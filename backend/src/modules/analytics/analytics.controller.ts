import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Raporlama & Canlı Dashboard (Analytics)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Canlı yönetim paneli KPI, grafik ve kritik uyarı metrikleri' })
  getDashboard(@CurrentUser('tenantId') tenantId: string) {
    return this.analyticsService.getDashboardSummary(tenantId);
  }

  @Get('audit-reports/cost-analysis')
  @ApiOperation({ summary: 'Sayıştay ve İç Denetim Uyumlu Araç Başı Maliyet Raporu' })
  getAuditReport(@CurrentUser('tenantId') tenantId: string) {
    return this.analyticsService.getAuditCostReport(tenantId);
  }
}
