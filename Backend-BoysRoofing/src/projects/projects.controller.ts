import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  /** Público: proyectos para el mapa */
  @Get('map')
  getMapProjects() {
    return this.projects.findAllForMap();
  }

  /** Público: info del proyecto por token (para página de dejar review) */
  @Get('review/:token')
  getByToken(@Param('token') token: string) {
    return this.projects.findByToken(token);
  }

  /** Cliente: sube foto (token en URL) */
  @Post('review/:token/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReviewPhoto(
    @Param('token') token: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    if (!file?.buffer) throw new BadRequestException('No file uploaded');
    return this.projects.uploadReviewPhoto(token, file);
  }

  /** Cliente: envía review (nombre, mensaje, rating, photoUrl opcional) */
  @Post('review/:token')
  submitReview(
    @Param('token') token: string,
    @Body()
    body: { clientName?: string; message: string; rating?: number; photoUrl?: string },
  ) {
    return this.projects.submitReview(token, body);
  }

  /** Público: reviews aprobadas para la sección del sitio */
  @Get('reviews')
  getApprovedReviews() {
    return this.projects.getApprovedReviews();
  }

  // --------------- Admin ---------------

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllAdmin() {
    return this.projects.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    body: { name?: string; latitude: number; longitude: number; logoUrl: string },
  ) {
    return this.projects.create(body);
  }

  @Post('upload-logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    if (!file?.buffer) throw new BadRequestException('No file uploaded');
    return this.projects.uploadLogo(file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; latitude?: number; longitude?: number; logoUrl?: string },
  ) {
    return this.projects.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projects.remove(Number(id));
  }

  @Get(':id/reviews')
  @UseGuards(JwtAuthGuard)
  getProjectReviews(@Param('id') id: string) {
    return this.projects.getReviewsByProject(Number(id));
  }

  @Patch('reviews/:id/approve')
  @UseGuards(JwtAuthGuard)
  approveReview(@Param('id') id: string) {
    return this.projects.approveReview(Number(id));
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  deleteReview(@Param('id') id: string) {
    return this.projects.deleteReview(Number(id));
  }
}
