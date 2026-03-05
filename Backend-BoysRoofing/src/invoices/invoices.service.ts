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
   * Genera el PDF del invoice con diseño profesional (marco, cabecera, bloques).
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

      const pageWidth = 612;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      const leftX = margin;
      const rightEdge = pageWidth - margin;
      const brandBlue = '#1e3a5f';
      const brandBlueLight = '#2d5a87';
      const grayBg = '#f5f7fa';
      const grayBorder = '#e0e4e9';
      const grayText = '#4a5568';
      const darkText = '#1a202c';

      // ==========================
      // MARCO EXTERIOR
      // ==========================
      const frameInset = 8;
      doc
        .lineWidth(1.5)
        .strokeColor(brandBlue)
        .rect(frameInset, frameInset, pageWidth - frameInset * 2, 792 - frameInset * 2)
        .stroke();

      // ==========================
      // CABECERA CON FONDO (barra azul)
      // ==========================
      const headerH = 72;
      const headerTop = margin;
      doc
        .fillColor(brandBlue)
        .rect(leftX, headerTop, contentWidth, headerH)
        .fill();

      // Logo a la derecha (sobre la barra o al lado)
      const logoPath = 'src/assets/boys-roofing-logo.png';
      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, rightEdge - 72, headerTop + 6, {
            width: 60,
            height: 60,
          });
        }
      } catch {
        // sin logo si falla
      }

      // Título y contacto en blanco sobre la barra
      doc
        .fontSize(20)
        .fillColor('#ffffff')
        .text("BOY'S ROOFING", leftX, headerTop + 14, {
          width: contentWidth - 80,
          align: 'center',
        });
      doc
        .fontSize(9)
        .fillColor('#e8eef4')
        .text('409-868-8853  •  services@boysroofing.company', leftX, headerTop + 42, {
          width: contentWidth - 80,
          align: 'center',
        });

      const headerBottomY = headerTop + headerH;
      doc.y = headerBottomY + 18;

      // ==========================
      // INFORMACIÓN PRINCIPAL (bloques con fondo)
      // ==========================
      const rightX = 320;
      const blockY = headerBottomY + 18;
      const billToW = 260;
      const billToH = 72;
      const invoiceBoxW = 220;
      const invoiceBoxH = 58;

      // Fondo bloque "Bill to"
      doc
        .fillColor(grayBg)
        .rect(leftX, blockY, billToW, billToH)
        .fill();
      doc
        .lineWidth(0.5)
        .strokeColor(grayBorder)
        .rect(leftX, blockY, billToW, billToH)
        .stroke();

      doc
        .fontSize(10)
        .fillColor(brandBlue)
        .text('Bill to', leftX + 12, blockY + 10);
      doc
        .fontSize(10)
        .fillColor(darkText)
        .text(invoice.billTo || quote.name, leftX + 12, blockY + 24)
        .text(invoice.address || '', leftX + 12, blockY + 38)
        .text(`${invoice.city || ''}, ${invoice.state || ''} ${invoice.zip || ''}`, leftX + 12, blockY + 52)
        .text(`Phone: ${invoice.phone || ''}`, leftX + 12, blockY + 66);

      // Fondo bloque Invoice # / Date (derecha)
      doc
        .fillColor(grayBg)
        .rect(rightEdge - invoiceBoxW, blockY, invoiceBoxW, invoiceBoxH)
        .fill();
      doc
        .strokeColor(grayBorder)
        .rect(rightEdge - invoiceBoxW, blockY, invoiceBoxW, invoiceBoxH)
        .stroke();

      doc.fontSize(10).fillColor(brandBlue).text('Invoice #', rightEdge - invoiceBoxW + 12, blockY + 10);
      doc.fontSize(10).fillColor(darkText).text(String(invoice.invoiceNumber || ''), rightEdge - invoiceBoxW + 75, blockY + 10);
      doc.fontSize(10).fillColor(brandBlue).text('Date', rightEdge - invoiceBoxW + 12, blockY + 28);
      doc
        .fontSize(10)
        .fillColor(darkText)
        .text(
          invoice.invoiceDate instanceof Date
            ? invoice.invoiceDate.toLocaleDateString()
            : new Date(invoice.invoiceDate).toLocaleDateString(),
          rightEdge - invoiceBoxW + 75,
          blockY + 28,
        );
      doc.fontSize(10).fillColor(brandBlue).text('Phone', rightEdge - invoiceBoxW + 12, blockY + 46);
      doc.fontSize(10).fillColor(darkText).text(String(invoice.phone || ''), rightEdge - invoiceBoxW + 75, blockY + 46);

      doc.y = blockY + Math.max(billToH, invoiceBoxH) + 20;

      // Property location (título con línea)
      doc
        .fontSize(10)
        .fillColor(brandBlue)
        .text('Property location / roofing invoice', leftX, doc.y);
      doc.y += 14;
      doc
        .fillColor(grayBg)
        .rect(leftX, doc.y, contentWidth, 28)
        .fill();
      doc.strokeColor(grayBorder).rect(leftX, doc.y, contentWidth, 28).stroke();
      doc
        .fontSize(10)
        .fillColor(grayText)
        .text(invoice.propertyLocation || quote.propertyLocation || '—', leftX + 10, doc.y + 8, {
          width: contentWidth - 20,
        });
      doc.y += 36;

      // ==========================
      // TABLA DESCRIPCIÓN / PRECIO (cabecera con color)
      // ==========================
      const tableStartY = doc.y;
      const colDateW = 70;
      const colDescX = leftX + colDateW + 10;
      const colDescW = 350;
      const colPriceX = rightEdge - 75;

      doc
        .fillColor(brandBlue)
        .rect(leftX, tableStartY, contentWidth, 22)
        .fill();
      doc
        .fontSize(9)
        .fillColor('#ffffff')
        .text('Date', leftX + 8, tableStartY + 6);
      doc.text('Description', colDescX, tableStartY + 6);
      doc.text('Price', colPriceX, tableStartY + 6, { width: 70, align: 'right' });
      doc
        .lineWidth(0.5)
        .strokeColor(grayBorder)
        .rect(leftX, tableStartY, contentWidth, 22)
        .stroke();

      const rowY = tableStartY + 28;

      const invoiceDateStr =
        invoice.invoiceDate instanceof Date
          ? invoice.invoiceDate.toLocaleDateString()
          : new Date(invoice.invoiceDate).toLocaleDateString();

      doc.fontSize(10).fillColor(darkText).text(invoiceDateStr, leftX + 8, rowY);
      doc
        .fontSize(10)
        .fillColor(grayText)
        .text(invoice.description || '', colDescX, rowY, { width: colDescW });
      const descBottomY = doc.y;
      doc
        .fontSize(10)
        .fillColor(darkText)
        .text(`$${Number(invoice.price).toFixed(2)}`, colPriceX, rowY, {
          width: 70,
          align: 'right',
        });
      doc.y = descBottomY + 14;

      // ==========================
      // SUBTOTAL / OTHER / TOTAL
      // ==========================
      const totalsX = rightEdge - 200;
      let yTotals = doc.y;

      doc
        .moveTo(totalsX, yTotals)
        .lineTo(rightEdge, yTotals)
        .lineWidth(0.5)
        .strokeColor(grayBorder)
        .stroke();
      yTotals += 8;
      doc.fontSize(10).fillColor(grayText).text('Subtotal', totalsX, yTotals);
      doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, colPriceX, yTotals, { width: 70, align: 'right' });
      yTotals += 14;
      doc.fontSize(10).fillColor(grayText).text('Other', totalsX, yTotals);
      doc.text(`$${Number(invoice.other ?? 0).toFixed(2)}`, colPriceX, yTotals, { width: 70, align: 'right' });
      yTotals += 18;
      doc
        .moveTo(totalsX, yTotals)
        .lineTo(rightEdge, yTotals)
        .strokeColor(grayBorder)
        .stroke();
      yTotals += 8;
      doc.fontSize(12).fillColor(brandBlue).text('Total', totalsX, yTotals);
      doc.fontSize(12).fillColor(darkText).text(`$${Number(invoice.total).toFixed(2)}`, colPriceX, yTotals, { width: 70, align: 'right' });
      doc.y = yTotals + 24;

      // ==========================
      // FIRMA
      // ==========================
      const signatureLabelY = doc.y;
      doc.fontSize(10).fillColor(brandBlue).text('Signed:', leftX, signatureLabelY);
      const signatureLineY = signatureLabelY + 16;
      doc
        .moveTo(leftX + 45, signatureLineY)
        .lineTo(280, signatureLineY)
        .lineWidth(1)
        .strokeColor(grayBorder)
        .stroke();

      doc.y = signatureLineY + 24;

      // ==========================
      // FOOTER (con línea superior)
      // ==========================
      doc
        .moveTo(leftX, doc.y)
        .lineTo(rightEdge, doc.y)
        .lineWidth(0.5)
        .strokeColor(grayBorder)
        .stroke();
      doc.y += 14;
      doc.fontSize(9).fillColor(grayText).text("Make checks payable to Boy's Roofing", leftX, doc.y);
      doc.y += 14;
      doc.fontSize(9).fillColor(grayText).text('Paid Check: ___________________', leftX, doc.y);
      doc.y += 12;
      doc.text('Paid cash: ___________________', leftX, doc.y);

      doc
        .fontSize(10)
        .fillColor(brandBlue)
        .text('Thank you for your business!', leftX, 718, {
          width: contentWidth,
          align: 'center',
        });

      doc.end();
    });
  }
}
