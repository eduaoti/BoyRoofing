import { Module } from '@nestjs/common';
import { RoofReportController } from './roof-report.controller';
import { RoofReportService } from './roof-report.service';

@Module({
  controllers: [RoofReportController],
  providers: [RoofReportService],
})
export class RoofReportModule {}
