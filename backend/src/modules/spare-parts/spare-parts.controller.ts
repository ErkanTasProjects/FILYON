import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SparePartsService, CreateSparePartDto, StockInDto } from './spare-parts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ambar ve Yedek Parça Yönetimi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('spare-parts')
export class SparePartsController {
  constructor(private sparePartsService: SparePartsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm yedek parça stoklarını listele (Kritik stok bayraklı)' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.sparePartsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Parça detaylarını ve son stok hareketlerini getir' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.sparePartsService.findOne(tenantId, id);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Barkod / QR ile parça sorgula (Mobil Ambar/Usta)' })
  findByBarcode(
    @CurrentUser('tenantId') tenantId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.sparePartsService.findByBarcode(tenantId, barcode);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni yedek parça kartı tanımla' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSparePartDto,
  ) {
    return this.sparePartsService.create(tenantId, dto);
  }

  @Put(':id/stock-in')
  @ApiOperation({ summary: 'Ambara parça girişi yap (Satın Alma / Stok Artışı)' })
  stockIn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: StockInDto,
  ) {
    return this.sparePartsService.stockIn(tenantId, id, userId, dto);
  }
}
