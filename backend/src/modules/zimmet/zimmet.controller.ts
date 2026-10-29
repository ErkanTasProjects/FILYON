import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ZimmetService, AssignZimmetDto, ReturnZimmetDto } from './zimmet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Zimmet & Araç Teslim (QR Entegrasyonlu)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('zimmets')
export class ZimmetController {
  constructor(private zimmetService: ZimmetService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm aktif ve geçmiş zimmetleri listele' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.zimmetService.findAll(tenantId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Sürücüye araç teslim et (Muayene Kilidi Kontrollü)' })
  assign(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AssignZimmetDto,
  ) {
    return this.zimmetService.assign(tenantId, userId, dto);
  }

  @Post('return')
  @ApiOperation({ summary: 'Aracı iade al ve zimmeti sonlandır' })
  returnZimmet(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ReturnZimmetDto,
  ) {
    return this.zimmetService.returnZimmet(tenantId, dto);
  }
}
