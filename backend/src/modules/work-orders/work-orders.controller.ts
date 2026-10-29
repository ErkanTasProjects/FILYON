import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  WorkOrdersService,
  CreateWorkOrderDto,
  AddPartToWorkOrderDto,
  UploadScrapPhotoDto,
  CompleteWorkOrderDto,
} from './work-orders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('İş Emirleri & Sayıştay Hurda Kilidi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm iş emirlerini listele' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.workOrdersService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'İş emri detayları, parçalar ve hurda onaylarını getir' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.workOrdersService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni iş emri aç (Atölye Şefi)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') chiefId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrdersService.create(tenantId, chiefId, dto);
  }

  @Post(':id/parts')
  @ApiOperation({ summary: 'İş emrine ambardan yedek parça tahsis et' })
  addPart(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddPartToWorkOrderDto,
  ) {
    return this.workOrdersService.addPart(tenantId, id, userId, dto);
  }

  @Post(':id/scrap-photo')
  @ApiOperation({ summary: 'Sökülen hurda parçanın fotoğrafını yükle (Usta)' })
  uploadScrapPhoto(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UploadScrapPhotoDto,
  ) {
    return this.workOrdersService.uploadScrapPhoto(tenantId, id, dto);
  }

  @Put('scrap/:scrapRecordId/approve')
  @ApiOperation({ summary: 'Hurda parça teslimini onayla veya reddet (Ambar Yetkilisi)' })
  approveScrap(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') warehouseStaffId: string,
    @Param('scrapRecordId') scrapRecordId: string,
    @Body('approved') approved: boolean,
    @Body('notes') notes?: string,
  ) {
    return this.workOrdersService.approveScrapRecord(tenantId, scrapRecordId, warehouseStaffId, approved, notes);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'İş emrini tamamla ve kapat (Sayıştay Hurda Kilidi Korumalı)' })
  completeWorkOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: CompleteWorkOrderDto,
  ) {
    return this.workOrdersService.completeWorkOrder(tenantId, id, dto);
  }
}
