import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import PDFDocument = require('pdfkit');
import { QuoteStatus } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateInvoiceDto) {
    // 1) Verificar que exista la quote
    const quote = await this.prisma.quote.findUnique({
      where: { id: dto.quoteId },
    });

    if (!quote) {
      throw new Error('Quote not found');
    }

    // 2) Crear invoice en BD
    const invoice = await this.prisma.invoice.create({
      data: {
        quoteId: dto.quoteId,
        billTo: dto.billTo,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        propertyLocation: dto.propertyLocation,
        invoiceNumber: dto.invoiceNumber,
        invoiceDate: new Date(dto.invoiceDate),
        description: dto.description,
        price: dto.price,
        subtotal: dto.subtotal,
        other: dto.other ?? 0,
        total: dto.total,
      },
    });

    // 3) Marcar quote en proceso (IN_REVIEW)
    await this.prisma.quote.update({
      where: { id: dto.quoteId },
      data: { status: QuoteStatus.IN_REVIEW },
    });

    // 4) Generar PDF
    const pdfBuffer = await this.generateInvoicePdf(quote, invoice);

    // 5) Enviar correo al cliente con el PDF adjunto
    await this.mailService.sendInvoiceEmail({
      to: quote.email,
      quote,
      invoice,
      pdfBuffer,
    });

    // 6) Marcar quote como enviada (SENT)
    await this.prisma.quote.update({
      where: { id: dto.quoteId },
      data: { status: QuoteStatus.SENT },
    });

    // 7) Devolver invoice y PDF para descarga en el front
    return { invoice, pdfBuffer };
  }

  /**
   * Genera el PDF del invoice con diseño similar al formato físico.
   */
  private generateInvoicePdf(quote: any, invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // ==========================
      // ENCABEZADO / LOGO
      // ==========================
      const logoPath = 'src/assets/boys-roofing-logo.png';

      // Título centrado (BOY'S ROOFING)
      doc
        .fontSize(22)
        .fillColor('#111111')
        .text("BOY'S ROOFING", 40, 40, { align: 'center' });

      // Teléfono y correo (centrados debajo)
      doc
        .moveDown(0.2)
        .fontSize(10)
        .fillColor('#444444')
        .text('409-868-8853', 40, doc.y, { align: 'center' })
        .text('boysroofing@example.com', 40, doc.y, { align: 'center' });

      // Logo a la derecha (más arriba y un poco más chico)
      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 430, 5, {
            width: 90,
            height: 90,
          });
        } else {
          console.warn('Logo not found at', logoPath);
        }
      } catch (e) {
        console.warn('Error loading logo image:', e);
      }

      // Línea separadora debajo del encabezado
      const headerBottomY = 120;
      doc
        .moveTo(40, headerBottomY)
        .lineTo(575, headerBottomY)
        .lineWidth(1)
        .strokeColor('#DDDDDD')
        .stroke();

      doc.moveDown(2);

      // ==========================
      // INFORMACIÓN PRINCIPAL
      // ==========================
      const leftX = 40;
      const rightX = 320;

      // Posicionamos el cursor un poco abajo de la línea
      doc.y = headerBottomY + 15;

      // Bill To (similar a la hoja física)
      doc
        .fontSize(11)
        .fillColor('#111111')
        .text('Bill to:', leftX, doc.y);

      doc
        .moveDown(0.4)
        .fontSize(10)
        .fillColor('#333333')
        .text(invoice.billTo || quote.name, { align: 'left' })
        .text(invoice.address, { align: 'left' })
        .text(
          `${invoice.city}, ${invoice.state} ${invoice.zip}`,
          { align: 'left' },
        )
        .moveDown(0.3)
        .text(`Phone: ${invoice.phone}`, { align: 'left' });

      // Guardar Y actual para usarla de referencia
      const afterBillToY = doc.y;

      // Phone / Invoice # / Date a la derecha
      doc.y = headerBottomY + 15;

      doc
        .fontSize(11)
        .fillColor('#111111')
        .text('Phone:', rightX, doc.y);

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(String(invoice.phone || ''), rightX + 50, doc.y);

      doc.moveDown(0.6);
      doc
        .fontSize(11)
        .fillColor('#111111')
        .text('Invoice #:', rightX, doc.y);

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(String(invoice.invoiceNumber || ''), rightX + 70, doc.y);

      doc.moveDown(0.6);
      doc
        .fontSize(11)
        .fillColor('#111111')
        .text('Invoice Date:', rightX, doc.y);

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(
          invoice.invoiceDate instanceof Date
            ? invoice.invoiceDate.toLocaleDateString()
            : new Date(invoice.invoiceDate).toLocaleDateString(),
          rightX + 80,
          doc.y,
        );

      // Continuar después del bloque de la izquierda
      doc.y = Math.max(afterBillToY + 10, doc.y + 20);

      // Property location (como en el formato)
      doc
        .fontSize(10)
        .fillColor('#111111')
        .text('Property location / roofing invoice:', leftX, doc.y);

      doc
        .moveDown(0.3)
        .fontSize(10)
        .fillColor('#333333')
        .text(invoice.propertyLocation || quote.propertyLocation || '');

      doc.moveDown(0.8);

      // Línea separadora antes de la tabla de descripción/precios
      doc
        .moveTo(40, doc.y)
        .lineTo(575, doc.y)
        .lineWidth(1)
        .strokeColor('#DDDDDD')
        .stroke();

      doc.moveDown(0.8);

      // ==========================
      // DESCRIPCIÓN Y PRECIO (tabla)
      // ==========================
      const tableStartY = doc.y;

      doc
        .fontSize(10)
        .fillColor('#111111')
        .text('Date', leftX, tableStartY);

      doc.text('Description', leftX + 80, tableStartY);
      doc.text('Price', 500, tableStartY, { width: 70, align: 'right' });

      // Línea debajo de las cabeceras
      doc
        .moveTo(40, tableStartY + 14)
        .lineTo(575, tableStartY + 14)
        .lineWidth(0.8)
        .strokeColor('#CCCCCC')
        .stroke();

      doc.moveDown(1);

      const rowY = doc.y;

      // Date
      const invoiceDateStr =
        invoice.invoiceDate instanceof Date
          ? invoice.invoiceDate.toLocaleDateString()
          : new Date(invoice.invoiceDate).toLocaleDateString();

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(invoiceDateStr, leftX, rowY);

      // Description
      doc.text(invoice.description || '', leftX + 80, rowY, {
        width: 380,
      });

      // Price
      doc.text(`$${Number(invoice.price).toFixed(2)}`, 500, rowY, {
        width: 70,
        align: 'right',
      });

      // Dejar espacio visual para más filas
      doc.moveDown(5);

      // ==========================
      // SUBTOTAL / OTHER / TOTAL
      // ==========================
      const totalsX = 380;
      let yTotals = doc.y;

      doc
        .moveTo(totalsX, yTotals)
        .lineTo(575, yTotals)
        .lineWidth(0.8)
        .strokeColor('#CCCCCC')
        .stroke();

      yTotals += 6;

      doc
        .fontSize(10)
        .fillColor('#333333')
        .text('Subtotal', totalsX, yTotals);

      doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, 500, yTotals, {
        width: 70,
        align: 'right',
      });

      yTotals += 14;
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text('Other', totalsX, yTotals);

      doc.text(`$${Number(invoice.other ?? 0).toFixed(2)}`, 500, yTotals, {
        width: 70,
        align: 'right',
      });

      yTotals += 18;

      doc
        .moveTo(totalsX, yTotals)
        .lineTo(575, yTotals)
        .lineWidth(0.8)
        .strokeColor('#CCCCCC')
        .stroke();

      yTotals += 6;

      doc
        .fontSize(11)
        .fillColor('#111111')
        .text('Total', totalsX, yTotals);

      doc.text(`$${Number(invoice.total).toFixed(2)}`, 500, yTotals, {
        width: 70,
        align: 'right',
      });

      doc.moveDown(4);

      // ==========================
      // FIRMA
      // ==========================
      const signatureLabelY = doc.y;
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text('Signed:', leftX, signatureLabelY);

      const signatureLineY = signatureLabelY + 15;
      doc
        .moveTo(leftX + 50, signatureLineY)
        .lineTo(300, signatureLineY)
        .lineWidth(1)
        .strokeColor('#444444')
        .stroke();

      doc.moveDown(4);

      // ==========================
      // FOOTER
      // ==========================
      doc
        .fontSize(9)
        .fillColor('#444444')
        .text("Make checks payable to Boy's Roofing", 40, doc.y, {
          align: 'left',
        });

      doc.moveDown(2);

      doc
        .fontSize(9)
        .fillColor('#444444')
        .text('Paid Check: ___________________', 40, doc.y);

      doc.moveDown(0.8);
      doc.text('Paid cash: ___________________', 40, doc.y);

      // Mensaje final centrado
      doc
        .fontSize(9)
        .fillColor('#777777')
        .text('Thank you for your business!!', 40, 720, { align: 'center' });

      doc.end();
    });
  }
}
