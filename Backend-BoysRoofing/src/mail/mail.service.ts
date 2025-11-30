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
        subject: `Invoice #${invoice.invoiceNumber} - Boys Roofing`,
        html: `
          <h2>Your roofing estimate is ready</h2>
          <p>Hi ${quote.name},</p>
          <p>Attached you will find the invoice for your roofing project.</p>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Total:</strong> $${Number(invoice.total).toFixed(2)}</p>
          <br />
          <small>Message sent automatically by Boys Roofing Website.</small>
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
