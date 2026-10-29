import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('FILYON_Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  const globalPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('FILYON API')
    .setDescription('FILYON: Kapsamlı Filo & Makine İkmal Yönetim Bilgi Sistemi Kurumsal API Dokümantasyonu')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 FILYON API Servisi Başlatıldı: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📑 Swagger API Dokümantasyonu: http://localhost:${port}/docs`);
}

bootstrap();
