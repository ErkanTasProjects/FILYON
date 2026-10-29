import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IssueReportsService, CreateIssueReportDto } from './issue-reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Arıza Bildirimleri (Şoför & Saha)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('issue-reports')
export class IssueReportsController {
  constructor(private issueReportsService: IssueReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm arıza bildirimlerini listele' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.issueReportsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Arıza bildirimi detayını (ses ve fotoğraflar dahil) getir' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.issueReportsService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni arıza bildirimi oluştur (Şoför - Fotoğraf & Sesli Not)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') driverId: string,
    @Body() dto: CreateIssueReportDto,
  ) {
    return this.issueReportsService.create(tenantId, driverId, dto);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Mobil çevrimdışı (offline) biriken arıza kayıtlarını senkronize et' })
  syncBatch(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') driverId: string,
    @Body('reports') reports: CreateIssueReportDto[],
  ) {
    return this.issueReportsService.syncOfflineBatch(tenantId, driverId, reports);
  }
}
