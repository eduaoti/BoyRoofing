import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

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

  async sendQuoteEmail(data: any) {
    const html = `
      <h2>Nueva solicitud de cotización</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.phone}</p>
      <p><strong>Servicio:</strong> ${data.service}</p>
      <p><strong>Mensaje:</strong> ${data.message || "Ninguno"}</p>
      <br>
      <small>Mensaje enviado automáticamente por Boys Roofing Website.</small>
    `;

    await this.transporter.sendMail({
      from: `"Boys Roofing Web" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: "Nueva solicitud de cotización",
      html,
    });
  }
}
