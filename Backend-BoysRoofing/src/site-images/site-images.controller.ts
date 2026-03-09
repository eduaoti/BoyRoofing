import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { SiteImagesService } from './site-images.service';
import { UpdateSiteImageDto } from './dto/update-site-image.dto';

@Controller('site-images')
export class SiteImagesController {
  constructor(private readonly siteImagesService: SiteImagesService) {}

  /** Público: devuelve el mapa de key -> url para el sitio */
  @Get()
  getImageMap() {
    return this.siteImagesService.getImageMap();
  }

  /** Admin: actualiza la URL de una key */
  @Patch(':key')
  @UseGuards(JwtAuthGuard)
  async setUrl(@Param('key') key: string, @Body() dto: UpdateSiteImageDto) {
    return this.siteImagesService.setImageUrl(key, dto.url);
  }

  /** Admin: sube imagen a Cloudinary y devuelve la URL */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded');
    }
    return this.siteImagesService.uploadToCloudinary(file);
  }
}
