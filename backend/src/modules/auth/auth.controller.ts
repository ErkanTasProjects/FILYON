import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@ApiTags('Kimlik Doğrulama (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı Girişi (Tüm Roller)' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı, JWT token döner.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Yeni Kullanıcı Kaydı' })
  @ApiResponse({ status: 201, description: 'Kayıt başarılı, yeni hesap ve token döner.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
