import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { MailService } from '../mail/mail.service';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly mailService: MailService) {}

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
