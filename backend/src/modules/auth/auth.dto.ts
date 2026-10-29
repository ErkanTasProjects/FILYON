import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'admin@filyon.gov.tr' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'demo123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'FILYON-DEMO-2026', required: false })
  @IsString()
  @IsOptional()
  tenantCode?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@filyon.gov.tr' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Kaya' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+90 532 100 0006', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'DRIVER', enum: UserRole, default: UserRole.DRIVER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 'FILYON-DEMO-2026', required: false })
  @IsString()
  @IsOptional()
  tenantCode?: string;
}
