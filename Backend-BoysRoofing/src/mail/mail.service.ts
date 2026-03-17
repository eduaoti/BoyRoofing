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

  // ------------------------------------------------------
  // 3️⃣ EMAIL: Enviar recibo de pago al cliente (normal, saldo pendiente o agradecimiento)
  // ------------------------------------------------------
  async sendReceiptEmail(params: {
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
    signatureUrl?: string;
    receiptType?: 'payment' | 'balance_due' | 'thank_you';
    balanceInfo?: {
      totalPrice: number;
      totalPaid: number;
      balanceDue: number;
    };
    websiteLink?: string;
  }) {
    const { to, receipt, locale, logoUrl, signatureUrl, receiptType = 'payment', balanceInfo, websiteLink = 'https://www.boysroofing.company' } = params;
    if (!to?.trim()) {
      this.logger.error('❌ No se proporcionó email para el recibo');
      return;
    }
    const fmt = (n: number) =>
      new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD' }).format(n);
    const amountStr = fmt(receipt.amount);
    const dateStr = new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(receipt.date + 'T12:00:00'));

    const isEn = locale === 'en';
    const receivedFrom = isEn ? 'Received from' : 'Recibí de';
    const theSumOf = isEn ? 'the sum of' : 'la cantidad de';
    const forConcept = isEn ? 'for' : 'por concepto de';
    const notesLabel = isEn ? 'Notes' : 'Notas';
    const signatureLabel = isEn ? 'Signature' : 'Firma';

    let subject: string;
    let title: string;
    let greeting: string;
    let extraHtml = '';

    if (receiptType === 'balance_due' && balanceInfo && balanceInfo.balanceDue > 0) {
      const balanceStr = fmt(balanceInfo.balanceDue);
      subject = isEn
        ? `Balance due ${balanceStr} – Receipt ${receipt.receiptNumber} – Boy's Roofing`
        : `Saldo pendiente ${balanceStr} – Recibo ${receipt.receiptNumber} – Boy's Roofing`;
      title = isEn ? 'Payment receipt – Balance due' : 'Recibo de pago – Saldo pendiente';
      greeting = isEn
        ? `Hi ${receipt.clientName}, please find your payment receipt below. You have a balance due of ${balanceStr}.`
        : `Hola ${receipt.clientName}, adjunto encontrará su recibo de pago. Usted me queda a deber ${balanceStr}.`;
      extraHtml = `
        <div style="background: #fff3cd; border: 1px solid #e0c000; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #856404;"><strong>${isEn ? 'Total agreed' : 'Total acordado'}</strong> ${fmt(balanceInfo.totalPrice)}</p>
          <p style="margin: 0 0 6px; font-size: 13px; color: #856404;"><strong>${isEn ? 'Total paid' : 'Total pagado'}</strong> ${fmt(balanceInfo.totalPaid)}</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #BA181B;">${isEn ? 'Balance due' : 'Saldo pendiente'}: ${balanceStr}</p>
        </div>`;
    } else if (receiptType === 'thank_you' && balanceInfo) {
      subject = isEn
        ? `Thank you – Payment complete – Boy's Roofing`
        : `Gracias por confiar en nosotros – Boy's Roofing`;
      title = isEn ? 'Thank you – Payment complete' : 'Gracias por confiar en nosotros';
      greeting = isEn
        ? `Hi ${receipt.clientName}, thank you for your trust. Your balance is paid in full. We hope to serve you again.`
        : `Hola ${receipt.clientName}, gracias por confiar en nosotros. Su saldo está saldado. Esperamos poder atenderle de nuevo.`;
      extraHtml = `
        <div style="background: #d4edda; border: 1px solid #28a745; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px; font-size: 14px; color: #155724;"><strong>${isEn ? 'Total paid' : 'Total pagado'}</strong> ${fmt(balanceInfo.totalPaid)}</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #155724;">${isEn ? 'Balance due' : 'Saldo pendiente'}: ${fmt(0)}</p>
        </div>
        <p style="margin: 16px 0 0; font-size: 14px;">${isEn ? 'Visit our website' : 'Visita nuestra web'}: <a href="${websiteLink}" style="color: #BA181B;">${websiteLink}</a></p>`;
    } else {
      subject = isEn
        ? `Payment receipt ${receipt.receiptNumber} – Boy's Roofing`
        : `Recibo de pago ${receipt.receiptNumber} – Boy's Roofing`;
      title = isEn ? 'Payment receipt' : 'Recibo de pago';
      greeting = isEn
        ? `Hi ${receipt.clientName}, please find your payment receipt below.`
        : `Hola ${receipt.clientName}, adjunto encontrará su recibo de pago.`;
    }

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Boy's Roofing" style="height: 56px; width: auto; display: block; margin: 0 auto 12px;" />`
      : '';

    try {
      await this.resend.emails.send({
        from: this.from,
        to: to.trim(),
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
            <div style="background: #161A1D; padding: 24px 28px; border-radius: 12px 12px 0 0; text-align: center;">
              ${logoHtml}
              <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 700;">Boy's Roofing</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${title}</p>
            </div>
            <div style="padding: 28px; background: #f5f5f5; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 16px; font-size: 16px;">${greeting}</p>
              <div style="background: #fff; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #666;"><strong>${isEn ? 'Receipt #' : 'Recibo #'}</strong> ${receipt.receiptNumber}</p>
                <p style="margin: 0 0 8px; font-size: 13px; color: #666;"><strong>${isEn ? 'Date' : 'Fecha'}</strong> ${dateStr}</p>
                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.5;">${receivedFrom} <strong>${receipt.clientName}</strong> ${theSumOf} <strong style="color: #BA181B;">${amountStr}</strong> ${forConcept} <strong>${receipt.concept}</strong>.</p>
                ${receipt.notes ? `<p style="margin: 0; font-size: 13px; color: #555;"><strong>${notesLabel}:</strong> ${receipt.notes}</p>` : ''}
              </div>
              ${extraHtml}
              <p style="margin: 16px 0 0; font-size: 12px; color: #6b6b6b;">${signatureLabel}</p>
              ${signatureUrl ? `<img src="${signatureUrl}" alt="" style="height: 40px; width: auto; max-width: 120px; margin-top: 6px;" />` : '<p style="margin-top: 6px;">_________________________</p>'}
              ${receiptType === 'payment' ? `<p style="margin: 20px 0 0; font-size: 12px; color: #6b6b6b;">${isEn ? 'Visit' : 'Visita'} ${websiteLink}</p>` : ''}
            </div>
          </div>
        `,
      });
      this.logger.log('📄 Recibo enviado por correo correctamente');
    } catch (error) {
      this.logger.error('❌ Error enviando recibo por correo', error);
      throw error;
    }
  }
}
