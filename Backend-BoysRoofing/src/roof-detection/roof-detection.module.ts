import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoofDetectionController } from './roof-detection.controller';
import { RoofDetectionService } from './roof-detection.service';

@Module({
  imports: [AuthModule],
  controllers: [RoofDetectionController],
  providers: [RoofDetectionService],
})
export class RoofDetectionModule {}
