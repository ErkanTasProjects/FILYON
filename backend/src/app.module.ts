import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ZimmetModule } from './modules/zimmet/zimmet.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { IssueReportsModule } from './modules/issue-reports/issue-reports.module';
import { SparePartsModule } from './modules/spare-parts/spare-parts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    VehiclesModule,
    ZimmetModule,
    WorkOrdersModule,
    IssueReportsModule,
    SparePartsModule,
    AnalyticsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
