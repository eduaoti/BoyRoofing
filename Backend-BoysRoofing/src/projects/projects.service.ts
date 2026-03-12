import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';
import { SiteImagesService } from '../site-images/site-images.service';

const TOKEN_LENGTH = 12;

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = randomBytes(TOKEN_LENGTH);
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly siteImages: SiteImagesService,
  ) {}

  /** Lista proyectos para el mapa (público), con reseñas aprobadas para el popup */
  async findAllForMap() {
    return this.prisma.mapProject.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            clientName: true,
            message: true,
            rating: true,
            photoUrl: true,
          },
        },
      },
    });
  }

  /** Obtiene un proyecto por token (público, para la página de dejar review) */
  async findByToken(token: string) {
    const project = await this.prisma.mapProject.findUnique({
      where: { token: token.toLowerCase() },
      select: { id: true, name: true, logoUrl: true, token: true },
    });
    if (!project) throw new BadRequestException('Link inválido o expirado');
    return project;
  }

  /** Admin: lista todos los proyectos con link */
  async findAllAdmin() {
    const projects = await this.prisma.mapProject.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { reviews: true } } },
    });
    return projects.map((p) => ({
      ...p,
      reviewLink: `/review/${p.token}`,
    }));
  }

  /** Admin: crea proyecto y devuelve link */
  async create(data: {
    name?: string;
    latitude: number;
    longitude: number;
    logoUrl: string;
  }) {
    const token = generateToken();
    const project = await this.prisma.mapProject.create({
      data: {
        token,
        name: data.name?.trim() || null,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        logoUrl: data.logoUrl.trim(),
      },
    });
    return { ...project, reviewLink: `/review/${project.token}` };
  }

  /** Admin: actualiza proyecto */
  async update(
    id: number,
    data: { name?: string; latitude?: number; longitude?: number; logoUrl?: string },
  ) {
    return this.prisma.mapProject.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() || null }),
        ...(data.latitude !== undefined && { latitude: Number(data.latitude) }),
        ...(data.longitude !== undefined && { longitude: Number(data.longitude) }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl.trim() }),
      },
    });
  }

  /** Admin: elimina proyecto (cascade reviews) */
  async remove(id: number) {
    return this.prisma.mapProject.delete({ where: { id } });
  }

  /** Sube logo a Cloudinary (reutiliza site-images) */
  async uploadLogo(file: { buffer: Buffer; mimetype: string }) {
    return this.siteImages.uploadToCloudinary(file);
  }

  // --------------- Project reviews (cliente deja foto + review por link) ---------------

  /** Cliente sube foto para la review (público pero requiere token válido) */
  async uploadReviewPhoto(token: string, file: { buffer: Buffer; mimetype: string }) {
    const project = await this.prisma.mapProject.findUnique({
      where: { token: token.toLowerCase() },
    });
    if (!project) throw new BadRequestException('Link inválido o expirado');
    const result = await this.siteImages.uploadToCloudinary(file);
    return { url: result.url };
  }

  /** Cliente envía review desde el link (token) */
  async submitReview(
    token: string,
    data: { clientName?: string; message: string; rating?: number; photoUrl?: string },
  ) {
    const project = await this.prisma.mapProject.findUnique({
      where: { token: token.toLowerCase() },
    });
    if (!project) throw new BadRequestException('Link inválido o expirado');
    const message = String(data.message || '').trim();
    if (!message) throw new BadRequestException('El mensaje es obligatorio');
    const rating = data.rating != null ? Math.min(5, Math.max(1, Number(data.rating))) : 5;
    return this.prisma.projectReview.create({
      data: {
        projectId: project.id,
        clientName: data.clientName?.trim() || null,
        photoUrl: data.photoUrl?.trim() || null,
        message,
        rating,
      },
    });
  }

  /** Público: lista de reviews aprobadas (para la sección de reviews del sitio) */
  async getApprovedReviews() {
    return this.prisma.projectReview.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true, logoUrl: true } },
      },
    });
  }

  /** Admin: reviews de un proyecto */
  async getReviewsByProject(projectId: number) {
    return this.prisma.projectReview.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Admin: aprobar review */
  async approveReview(id: number) {
    return this.prisma.projectReview.update({
      where: { id },
      data: { approved: true },
    });
  }

  /** Admin: eliminar review */
  async deleteReview(id: number) {
    return this.prisma.projectReview.delete({ where: { id } });
  }
}
