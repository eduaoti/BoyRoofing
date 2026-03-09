import { Module } from '@nestjs/common';
import { SiteImagesController } from './site-images.controller';
import { SiteImagesService } from './site-images.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SiteImagesController],
  providers: [SiteImagesService, PrismaService],
})
export class SiteImagesModule {}
