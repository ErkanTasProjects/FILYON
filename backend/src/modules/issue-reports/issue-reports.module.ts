import { Module } from '@nestjs/common';
import { IssueReportsService } from './issue-reports.service';
import { IssueReportsController } from './issue-reports.controller';

@Module({
  controllers: [IssueReportsController],
  providers: [IssueReportsService],
  exports: [IssueReportsService],
})
export class IssueReportsModule {}
