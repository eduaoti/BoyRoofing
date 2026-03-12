import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SiteImagesModule } from '../site-images/site-images.module';
import { PrismaService } from '../prisma.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [AuthModule, SiteImagesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService],
})
export class ProjectsModule {}
