import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VehiclesService, CreateVehicleDto } from './vehicles.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Araçlar ve İş Makineleri (Vehicles)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm araçları ve muayene kilidi durumlarını listele' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.vehiclesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Araç detaylarını, son zimmet ve iş emirlerini getir' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.vehiclesService.findOne(tenantId, id);
  }

  @Get('qr/:qrToken')
  @ApiOperation({ summary: 'Kabin QR kodu ile araç sorgula (Mobil Şoför/Zimmet)' })
  findByQr(@Param('qrToken') qrToken: string) {
    return this.vehiclesService.findByQrToken(qrToken);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni araç veya iş makinesi tanımla' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(tenantId, dto);
  }

  @Put(':id/meter')
  @ApiOperation({ summary: 'Araç KM veya Çalışma Saati sayacını güncelle' })
  updateMeter(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body('currentMeter') currentMeter: number,
  ) {
    return this.vehiclesService.updateMeter(tenantId, id, currentMeter);
  }
}
