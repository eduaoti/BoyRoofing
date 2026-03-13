import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoofReportController } from './roof-report.controller';
import { RoofReportService } from './roof-report.service';

@Module({
  imports: [AuthModule],
  controllers: [RoofReportController],
  providers: [RoofReportService],
})
export class RoofReportModule {}
