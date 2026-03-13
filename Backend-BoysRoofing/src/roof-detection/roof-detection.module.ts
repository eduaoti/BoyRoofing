import { Module } from '@nestjs/common';
import { RoofDetectionController } from './roof-detection.controller';
import { RoofDetectionService } from './roof-detection.service';

@Module({
  controllers: [RoofDetectionController],
  providers: [RoofDetectionService],
})
export class RoofDetectionModule {}
