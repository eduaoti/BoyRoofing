import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { MailService } from '../mail/mail.service';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(
    private readonly mailService: MailService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  @Get()
  findAll() {
    return this.receiptsService.findAll();
  }

  @Get('next-number')
  getNextNumber() {
    return this.receiptsService.getNextReceiptNumber();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateReceiptDto) {
    return this.receiptsService.create(dto);
  }

  @Patch(':id')
  updateClientEmail(@Param('id') id: string, @Body() body: { clientEmail?: string | null }) {
    return this.receiptsService.updateClientEmail(+id, body.clientEmail ?? null);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptsService.remove(+id);
  }

  @Post('send-email')
  async sendEmail(
    @Body()
    body: {
      to: string;
      receipt: {
        receiptNumber: string;
        date: string;
        clientName: string;
        amount: number;
        concept: string;
        notes?: string;
      };
      locale: 'en' | 'es';
      logoUrl?: string;
    },
  ) {
    await this.mailService.sendReceiptEmail({
      to: body.to,
      receipt: body.receipt,
      locale: body.locale,
      logoUrl: body.logoUrl,
    });
    return { ok: true, message: 'Receipt email sent' };
  }
}
