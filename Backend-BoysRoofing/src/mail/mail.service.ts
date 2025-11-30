import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // 🔹 Correo cuando llega una nueva cotización desde la web
  async sendQuoteEmail(data: any) {
    const html = `
      <h2>Nueva solicitud de cotización</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.phone}</p>
      <p><strong>Servicio:</strong> ${data.service}</p>
      <p><strong>Mensaje:</strong> ${data.message || 'Ninguno'}</p>
      <br>
      <small>Mensaje enviado automáticamente por Boys Roofing Website.</small>
    `;

    await this.transporter.sendMail({
      from: `"Boys Roofing Web" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: 'Nueva solicitud de cotización',
      html,
    });
  }

  // 🔹 Correo al cliente con el invoice en PDF adjunto
  async sendInvoiceEmail(params: {
    to: string;
    quote: any;
    invoice: any;
    pdfBuffer: Buffer;
  }) {
    const { to, quote, invoice, pdfBuffer } = params;

    const html = `
      <h2>Your roofing estimate is ready</h2>
      <p>Hi ${quote.name},</p>
      <p>Attached you will find the invoice for your roofing project.</p>
      <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
      <p><strong>Total:</strong> $${Number(invoice.total).toFixed(2)}</p>
      <br />
      <small>Message sent automatically by Boys Roofing Website.</small>
    `;

    await this.transporter.sendMail({
      from: `"Boys Roofing Web" <${process.env.MAIL_USER}>`,
      to,
      subject: `Invoice #${invoice.invoiceNumber} - Boys Roofing`,
      html,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }
}
