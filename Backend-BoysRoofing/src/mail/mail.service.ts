import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  private readonly from: string;
  private readonly adminTo: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    const adminTo = process.env.MAIL_TO;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in .env');
    }
    if (!from) {
      throw new Error('MAIL_FROM is not defined in .env');
    }
    if (!adminTo) {
      throw new Error('MAIL_TO is not defined in .env');
    }

    this.resend = new Resend(apiKey);
    this.from = from;
    this.adminTo = adminTo;
  }

  // ------------------------------------------------------
  // 1️⃣ EMAIL: Nueva solicitud de cotización
  // ------------------------------------------------------
  async sendQuoteEmail(data: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message?: string;
  }) {
    try {
      await this.resend.emails.send({
        from: this.from,
        to: this.adminTo, // ✅ siempre string
        subject: 'Nueva solicitud de cotización',
        html: `
          <h2>Nueva solicitud de cotización</h2>
          <p><strong>Nombre:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Teléfono:</strong> ${data.phone}</p>
          <p><strong>Servicio:</strong> ${data.service}</p>
          <p><strong>Mensaje:</strong> ${data.message || 'Ninguno'}</p>
          <br>
          <small>Mensaje enviado automáticamente por Boys Roofing Website.</small>
        `,
      });

      this.logger.log('🚀 Quote email enviado correctamente');
    } catch (error) {
      this.logger.error('❌ Error enviando correo de cotización', error);
    }
  }

  // ------------------------------------------------------
  // 2️⃣ EMAIL: Enviar invoice con PDF adjunto
  // ------------------------------------------------------
  async sendInvoiceEmail(params: {
    to: string;            // 👈 aquí obligamos a que sea string
    quote: any;
    invoice: any;
    pdfBuffer: Buffer;
  }) {
    const { to, quote, invoice, pdfBuffer } = params;

    if (!to) {
      this.logger.error('❌ No se proporcionó email del cliente para el invoice');
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.from,
        to, // ✅ to es string garantizado
        subject: `Your roofing estimate is ready – Invoice #${invoice.invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
            <div style="background: #161A1D; padding: 24px 28px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 700;">Boys Roofing</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your estimate is ready</p>
            </div>
            <div style="padding: 28px; background: #f5f5f5; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 16px; font-size: 16px;">Hi ${quote.name},</p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5;">Great news — your roofing estimate is ready. You’ll find the invoice attached to this email with all the details of your project.</p>
              <div style="background: #ebebeb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #e0e0e0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #4a4a4a;"><strong>Invoice #</strong> ${invoice.invoiceNumber}</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #BA181B;">Total: $${Number(invoice.total).toFixed(2)}</p>
              </div>
              <p style="margin: 0 0 20px; font-size: 15px;">Visit our website to learn more about our services, read reviews, and get in touch with us.</p>
              <a href="https://www.boysroofing.company/en" style="display: inline-block; background: #BA181B; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">Visit Boys Roofing</a>
              <p style="margin: 24px 0 0; font-size: 12px; color: #6b6b6b;">Message sent automatically by Boys Roofing.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer.toString('base64'),
          },
        ],
      });

      this.logger.log('📄 Invoice enviado correctamente');
    } catch (error) {
      this.logger.error('❌ Error enviando invoice PDF', error);
    }
  }
}
