import { Controller, Post, Body, BadRequestException, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuoteStatus } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Comprueba si un correo puede dejar reseña (tiene cotización con factura enviada y aún no ha dejado reseña).
   */
  @Get('can-review')
  async canReview(@Query('email') email: string) {
    if (!email || typeof email !== 'string') {
      return { canReview: false };
    }
    const normalizedEmail = email.trim().toLowerCase();
    const quote = await this.prisma.quote.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        status: QuoteStatus.SENT,
      },
      include: {
        invoice: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!quote || !quote.invoice) {
      return { canReview: false };
    }
    if (quote.reviews && quote.reviews.length > 0) {
      return { canReview: false };
    }
    return {
      canReview: true,
      quoteId: quote.id,
      name: quote.name,
    };
  }

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
    const quote = await this.prisma.quote.findUnique({
      where: { id: body.quoteId },
      include: { invoice: true, reviews: true },
    });
    if (!quote) {
      throw new BadRequestException('Quote not found');
    }
    if (quote.email.toLowerCase() !== body.email.trim().toLowerCase()) {
      throw new BadRequestException('Email does not match the quote');
    }
    if (quote.status !== QuoteStatus.SENT || !quote.invoice) {
      throw new BadRequestException('You can only leave a review after receiving an invoice');
    }
    if (quote.reviews && quote.reviews.length > 0) {
      throw new BadRequestException('This quote already has a review');
    }
    if (!body.message || String(body.message).trim().length === 0) {
      throw new BadRequestException('Message is required');
    }
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    return this.prisma.review.create({
      data: {
        quoteId: body.quoteId,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        rating,
        message: body.message.trim(),
      },
    });
  }

  @Get()
  async findAll() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        rating: true,
        message: true,
        createdAt: true,
      },
    });
  }
}
