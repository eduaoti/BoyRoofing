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
      const brandDark = '#161A1D';
      const brandRed = '#BA181B';
      const grayBg = '#f2f2f2';
      const grayBorder = '#e0e0e0';
      const grayText = '#4a4a4a';
      const darkText = '#1a1a1a';
      const radius = 10;

      // ==========================
      // MARCO EXTERIOR (color de la página: carbon/smoke)
      // ==========================
      const frameInset = 8;
      doc
        .lineWidth(1.5)
        .strokeColor(brandDark)
        .roundedRect(frameInset, frameInset, pageWidth - frameInset * 2, 792 - frameInset * 2, radius)
        .stroke();

      // ==========================
      // CABECERA (mismo oscuro que la web: br-smoke)
      // ==========================
      const headerH = 72;
      const headerTop = margin;
      doc
        .fillColor(brandDark)
        .roundedRect(leftX, headerTop, contentWidth, headerH, radius)
        .fill();

      // Logo sobre fondo claro para que se distinga en cabecera oscura
      const logoPath = 'src/assets/boys-roofing-logo.png';
      const logoX = rightEdge - 72;
      const logoY = headerTop + 6;
      const logoSize = 60;
      try {
        if (fs.existsSync(logoPath)) {
          doc
            .fillColor('#ffffff')
            .circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2)
            .fill();
          doc
            .lineWidth(0.5)
            .strokeColor(grayBorder)
            .circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2)
            .stroke();
          doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
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
      const billToH = 88;
      const invoiceBoxW = 220;
      const invoiceBoxH = 58;

      // Fondo bloque "Bill to" (redondeado, altura suficiente para que no se corte el teléfono)
      doc
        .fillColor(grayBg)
        .roundedRect(leftX, blockY, billToW, billToH, 6)
        .fill();
      doc
        .lineWidth(0.5)
        .strokeColor(grayBorder)
        .roundedRect(leftX, blockY, billToW, billToH, 6)
        .stroke();

      doc
        .fontSize(10)
        .fillColor(brandDark)
        .text('Bill to', leftX + 12, blockY + 10);
      doc
        .fontSize(10)
        .fillColor(darkText)
        .text(invoice.billTo || quote.name, leftX + 12, blockY + 24, { width: billToW - 24 })
        .text(invoice.address || '', leftX + 12, blockY + 38, { width: billToW - 24 })
        .text(`${invoice.city || ''}, ${invoice.state || ''} ${invoice.zip || ''}`.trim(), leftX + 12, blockY + 52, { width: billToW - 24 });
      doc.text(`Phone: ${invoice.phone || ''}`, leftX + 12, blockY + 66, { width: billToW - 24 });

      // Fondo bloque Invoice # / Date (derecha, redondeado)
      doc
        .fillColor(grayBg)
        .roundedRect(rightEdge - invoiceBoxW, blockY, invoiceBoxW, invoiceBoxH, 6)
        .fill();
      doc
        .strokeColor(grayBorder)
        .roundedRect(rightEdge - invoiceBoxW, blockY, invoiceBoxW, invoiceBoxH, 6)
        .stroke();

      doc.fontSize(10).fillColor(brandDark).text('Invoice #', rightEdge - invoiceBoxW + 12, blockY + 10);
      doc.fontSize(10).fillColor(darkText).text(String(invoice.invoiceNumber || ''), rightEdge - invoiceBoxW + 75, blockY + 10);
      doc.fontSize(10).fillColor(brandDark).text('Date', rightEdge - invoiceBoxW + 12, blockY + 28);
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
      doc.fontSize(10).fillColor(brandDark).text('Phone', rightEdge - invoiceBoxW + 12, blockY + 46);
      doc.fontSize(10).fillColor(darkText).text(String(invoice.phone || ''), rightEdge - invoiceBoxW + 75, blockY + 46);

      doc.y = blockY + Math.max(billToH, invoiceBoxH) + 20;

      // Property location (título, caja redondeada)
      doc
        .fontSize(10)
        .fillColor(brandDark)
        .text('Property location / roofing invoice', leftX, doc.y);
      doc.y += 14;
      const propBoxH = 32;
      doc
        .fillColor(grayBg)
        .roundedRect(leftX, doc.y, contentWidth, propBoxH, 6)
        .fill();
      doc.strokeColor(grayBorder).roundedRect(leftX, doc.y, contentWidth, propBoxH, 6).stroke();
      const propText = (invoice.propertyLocation || quote.propertyLocation || '—').slice(0, 200);
      doc
        .fontSize(9)
        .fillColor(grayText)
        .text(propText + (propText.length >= 200 ? '…' : ''), leftX + 10, doc.y + 8, {
          width: contentWidth - 20,
          height: propBoxH - 12,
          ellipsis: true,
        });
      doc.y += propBoxH + 8;

      // ==========================
      // TABLA DESCRIPCIÓN / PRECIO (cabecera con color)
      // ==========================
      const tableStartY = doc.y;
      const colDateW = 70;
      const colDescX = leftX + colDateW + 10;
      const colDescW = 350;
      const colPriceX = rightEdge - 75;

      doc
        .fillColor(brandDark)
        .roundedRect(leftX, tableStartY, contentWidth, 22, 6)
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
        .roundedRect(leftX, tableStartY, contentWidth, 22, 6)
        .stroke();

      const rowY = tableStartY + 28;

      const invoiceDateStr =
        invoice.invoiceDate instanceof Date
          ? invoice.invoiceDate.toLocaleDateString()
          : new Date(invoice.invoiceDate).toLocaleDateString();

      doc.fontSize(10).fillColor(darkText).text(invoiceDateStr, leftX + 8, rowY);
      const descText = (invoice.description || '').slice(0, 280);
      doc
        .fontSize(9)
        .fillColor(grayText)
        .text(descText + (descText.length >= 280 ? '…' : ''), colDescX, rowY, { width: colDescW, height: 22, ellipsis: true });
      doc
        .fontSize(10)
        .fillColor(darkText)
        .text(`$${Number(invoice.price).toFixed(2)}`, colPriceX, rowY, {
          width: 70,
          align: 'right',
        });
      doc.y = rowY + 22;

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
      doc.fontSize(12).fillColor(brandRed).text('Total', totalsX, yTotals);
      doc.fontSize(12).fillColor(darkText).text(`$${Number(invoice.total).toFixed(2)}`, colPriceX, yTotals, { width: 70, align: 'right' });
      doc.y = yTotals + 24;

      // ==========================
      // FIRMA
      // ==========================
      const signatureLabelY = doc.y;
      doc.fontSize(10).fillColor(brandDark).text('Signed:', leftX, signatureLabelY);
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
        .fillColor(brandRed)
        .text('Thank you for your business!', leftX, 718, {
          width: contentWidth,
          align: 'center',
        });

      doc.end();
    });
  }
}
