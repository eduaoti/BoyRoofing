import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RoofDetectionService } from './roof-detection.service';
import { DetectRoofDto } from './dto/detect-roof.dto';

const DEFAULT_ZOOM = 20;
const IMG_SIZE = 640;

@Controller('roof-detection')
@UseGuards(JwtAuthGuard)
export class RoofDetectionController {
  constructor(private readonly roofDetection: RoofDetectionService) {}

  @Post('detect')
  async detect(@Body() dto: DetectRoofDto) {
    const token = process.env.MAPBOX_TOKEN?.trim() || process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    if (!token) throw new Error('MAPBOX_TOKEN or NEXT_PUBLIC_MAPBOX_TOKEN required for roof detection');
    const zoom = dto.zoom ?? DEFAULT_ZOOM;
    const width = Math.min(1280, Math.max(256, dto.width ?? IMG_SIZE));
    const height = Math.min(1280, Math.max(256, dto.height ?? IMG_SIZE));
    const result = await this.roofDetection.detectRoof(
      dto.lng,
      dto.lat,
      zoom,
      width,
      height,
      token,
    );
    return result ?? { polygon: null, message: 'No roof contour found. Try centering the map on the roof.' };
  }
}
