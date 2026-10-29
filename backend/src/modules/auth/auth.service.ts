import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Kiracı (Tenant) bul veya varsayılan demo tenant'ı kullan
    let tenantId: string | undefined;
    if (dto.tenantCode) {
      const tenant = await this.prisma.tenant.findUnique({ where: { code: dto.tenantCode } });
      if (!tenant) throw new NotFoundException('Belirtilen kurum/kiracı kodu bulunamadı.');
      tenantId = tenant.id;
    }

    // 2. Kullanıcıyı ara
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        ...(tenantId ? { tenantId } : {}),
      },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    // 3. Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    // Demo kolaylığı: Eğer hash kontrolü geçemezse doğrudan 'demo123' test şifresine de tolerans tanıyalım
    const isDemoOverride = dto.password === 'demo123';
    
    if (!isPasswordValid && !isDemoOverride) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    // 4. JWT Token Oluştur
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
        tenantCode: user.tenant?.code,
      },
    };
  }

  async register(dto: RegisterDto) {
    // Kurum bul veya oluştur
    let tenant = await this.prisma.tenant.findFirst({
      where: dto.tenantCode ? { code: dto.tenantCode } : {},
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          code: dto.tenantCode || 'FILYON-KURUMSAL',
          name: 'FILYON Kurumsal Filo İşletmesi',
        },
      });
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi bu kurumda zaten kayıtlı.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role || UserRole.DRIVER,
      },
      include: { tenant: true },
    });

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Kayıt başarılı.',
      accessToken: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tenantName: newUser.tenant?.name,
      },
    };
  }
}
