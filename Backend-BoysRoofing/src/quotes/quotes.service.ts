import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: CreateQuoteDto) {
    const quote = await this.prisma.quote.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });

    await this.mailService.sendQuoteEmail(data);
    return quote;
  }

  /**
   * Crea una cotización solo para vincular una factura (desde el panel admin).
   * No envía el correo de "cotización recibida"; el envío será solo el de la factura.
   */
  async createForInvoice(data: CreateQuoteDto) {
    return this.prisma.quote.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.quote.findUnique({ where: { id } });
  }

  /**
   * ✅ Eliminar quote SOLO si no tiene invoices relacionados.
   * Si tiene invoice, la cerramos para conservar historial.
   */
  async remove(id: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Si ya tiene invoice, NO borrar: cerrar
    const invCount = await this.prisma.invoice.count({
      where: { quoteId: id },
    });

    if (invCount > 0) {
      await this.prisma.quote.update({
        where: { id },
        data: { status: 'CLOSED' },
      });

      // Puedes devolver un mensaje para el front si quieres
      return {
        ok: true,
        action: 'CLOSED',
        message: 'Quote has an invoice, so it was closed instead of deleted.',
      };
    }

    // Si NO tiene invoice, sí se puede borrar
    await this.prisma.quote.delete({ where: { id } });

    return { ok: true, action: 'DELETED' };
  }
}
