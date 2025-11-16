import { Injectable } from '@nestjs/common';
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
    const quote = await this.prisma.quote.create({ data });

    // 👇 Enviar correo automáticamente
    await this.mailService.sendQuoteEmail(data);

    return quote;
  }

  findAll() {
    return this.prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.quote.findUnique({ where: { id } });
  }

  async remove(id: number) {
  return this.prisma.quote.delete({ where: { id } });
}

}
