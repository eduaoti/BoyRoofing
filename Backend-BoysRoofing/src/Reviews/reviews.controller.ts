import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(
    @Body()
    body: {
      quoteId: number;
      name: string;
      email: string;
      rating: number;
      message: string;
    }
  ) {
    // Verifica que exista la cotización
    const quote = await this.prisma.quote.findUnique({
      where: { id: body.quoteId }
    });
    if (!quote) {
      throw new BadRequestException('Quote not found');
    }
    // Opcional: valida que el email coincida con el de la cotización
    if (quote.email !== body.email) {
      throw new BadRequestException('Email does not match the quote');
    }
    // Crea la reseña
    return this.prisma.review.create({
      data: {
        quoteId: body.quoteId,
        name: body.name,
        email: body.email,
        rating: body.rating,
        message: body.message
      }
    });
  }

  @Get()
  async findAll() {
    return this.prisma.review.findMany({
      include: { quote: true }
    });
  }

  // ...otros endpoints si los tienes...
}
