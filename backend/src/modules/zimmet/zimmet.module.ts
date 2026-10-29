import { Module } from '@nestjs/common';
import { ZimmetService } from './zimmet.service';
import { ZimmetController } from './zimmet.controller';

@Module({
  controllers: [ZimmetController],
  providers: [ZimmetService],
  exports: [ZimmetService],
})
export class ZimmetModule {}
