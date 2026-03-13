import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { GenerateRoofReportDto } from './dto/generate-roof-report.dto';

const BRAND_RED = '#BA181B';
const BRAND_RED_LIGHT = '#E5383B';
const BRAND_DARK = '#161A1D';
const BRAND_CARBON = '#0B090A';
const BRAND_PEARL = '#D3D3D3';
const GRAY_BG = '#f5f5f5';
const GRAY_BORDER = '#e0e0e0';
const GRAY_TEXT = '#4a4a4a';
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const SECTION_BAR_WIDTH = 4;
const SECTION_TITLE_FONT = 16;
const BODY_FONT = 10;
const SMALL_FONT = 9;

function fmt(n: number, decimals = 1): string {
  if (!Number.isFinite(n)) return '0';
  return n.toFixed(decimals);
}

@Injectable()
export class RoofReportService {
  async generatePdf(dto: GenerateRoofReportDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'LETTER', margin: MARGIN });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { address, measure, roofingSummary, polygon } = dto;
      const leftX = MARGIN;
      const rightEdge = PAGE_WIDTH - MARGIN;
      const hasDiagram = polygon && polygon.length >= 3;

      const addFooter = (pageNum: number, total: number) => {
        doc.fontSize(8).fillColor(GRAY_TEXT);
        doc.text(
          `Boy's Roofing  •  Roof Measurement Report  •  Page ${pageNum} of ${total}  •  © ${new Date().getFullYear()} Boy's Roofing`,
          leftX,
          PAGE_HEIGHT - 24,
          { width: CONTENT_WIDTH, align: 'center' }
        );
      };

      const totalPages = hasDiagram ? 5 : 4;
      let pageNum = 1;

      // ---------- PAGE 1: PORTADA ----------
      doc.fillColor(BRAND_DARK).rect(0, 0, PAGE_WIDTH, 100).fill();
      doc.fontSize(26).fillColor('#ffffff').text("BOY'S ROOFING", leftX, 24, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      doc.fontSize(13).fillColor(BRAND_PEARL).text('Roof Measurement Report', leftX, 52, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      doc.fontSize(10).fillColor('rgba(255,255,255,0.9)').text(
        `Generated ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`,
        leftX,
        78,
        { width: CONTENT_WIDTH, align: 'center' }
      );

      doc.y = 130;
      doc.fontSize(11).fillColor(BRAND_DARK).text('Property address', leftX, doc.y);
      doc.y += 18;
      doc.fontSize(13).fillColor(BRAND_CARBON).text(address || '—', leftX, doc.y, {
        width: CONTENT_WIDTH,
        align: 'left',
      });
      doc.y += 32;

      // Resumen destacado en caja
      const boxTop = doc.y;
      doc.fillColor(GRAY_BG).roundedRect(leftX, boxTop, CONTENT_WIDTH, 88, 6).fill();
      doc.strokeColor(GRAY_BORDER).roundedRect(leftX, boxTop, CONTENT_WIDTH, 88, 6).stroke();
      doc.fontSize(10).fillColor(BRAND_DARK).text('Summary', leftX + 16, boxTop + 14);
      doc.fontSize(11).fillColor(BRAND_RED).text(`Roof area (footprint): ${fmt(measure.areaFt2, 0)} sqft`, leftX + 16, boxTop + 32);
      doc.fillColor(BRAND_DARK).text(`Squares to order: ${fmt(roofingSummary.squaresWithWaste, 2)}`, leftX + 16, boxTop + 50);
      doc.text(`Perimeter (drip edge): ${fmt(measure.perimeterFt, 0)} ft  •  Pitch: ${roofingSummary.pitchKey}/12`, leftX + 16, boxTop + 68);
      doc.y = boxTop + 100;

      // Índice de contenidos
      doc.fontSize(10).fillColor(BRAND_DARK).text('Contents', leftX, doc.y);
      doc.y += 14;
      doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT);
      let tocItem = 1;
      if (hasDiagram) {
        doc.text(tocItem + '. Roof diagram', leftX, doc.y);
        doc.y += 16;
        tocItem++;
      }
      doc.text(tocItem + '. Length & area measurement', leftX, doc.y);
      doc.y += 16;
      tocItem++;
      doc.text(tocItem + '. Report summary & squares by waste', leftX, doc.y);
      doc.y += 16;
      tocItem++;
      doc.text(tocItem + '. Material calculations', leftX, doc.y);

      addFooter(pageNum++, totalPages);
      doc.addPage();

      // ---------- PAGE 2: DIAGRAMA (si hay polígono) ----------
      if (hasDiagram && polygon) {
        const sectionY = 48;
        doc.fillColor(BRAND_RED).rect(leftX, sectionY, SECTION_BAR_WIDTH, 18).fill();
        doc.fontSize(SECTION_TITLE_FONT).fillColor(BRAND_DARK).text('1. Roof diagram', leftX + SECTION_BAR_WIDTH + 10, sectionY);
        doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(address || '—', leftX, sectionY + 24, { width: CONTENT_WIDTH });

        const diagramTop = 90;
        const diagramSize = Math.min(420, CONTENT_WIDTH, PAGE_HEIGHT - diagramTop - 70);
        const [minLng, maxLng] = [Math.min(...polygon.map((p) => p[0])), Math.max(...polygon.map((p) => p[0]))];
        const [minLat, maxLat] = [Math.min(...polygon.map((p) => p[1])), Math.max(...polygon.map((p) => p[1]))];
        const rangeLng = maxLng - minLng || 0.0001;
        const rangeLat = maxLat - minLat || 0.0001;
        const pad = 0.12;
        const scaleX = (diagramSize * (1 - 2 * pad)) / rangeLng;
        const scaleY = (diagramSize * (1 - 2 * pad)) / rangeLat;
        const scale = Math.min(scaleX, scaleY);
        const cx = (minLng + maxLng) / 2;
        const cy = (minLat + maxLat) / 2;
        const toX = (lng: number) => leftX + diagramSize / 2 + (lng - cx) * scale;
        const toY = (lat: number) => diagramTop + diagramSize / 2 - (lat - cy) * scale;

        doc.strokeColor(GRAY_BORDER).rect(leftX, diagramTop, diagramSize, diagramSize).stroke();
        const pts = polygon;
        doc.moveTo(toX(pts[0][0]), toY(pts[0][1]));
        for (let i = 1; i < pts.length; i++) doc.lineTo(toX(pts[i][0]), toY(pts[i][1]));
        doc.closePath();
        doc.fillColor(BRAND_RED).opacity(0.25).strokeColor(BRAND_RED_LIGHT).lineWidth(2).fillAndStroke();
        doc.opacity(1);

        doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(
          'Roof outline from satellite measurement. For reference only; verify dimensions on site.',
          leftX,
          diagramTop + diagramSize + 14,
          { width: CONTENT_WIDTH }
        );
        addFooter(pageNum++, totalPages);
        doc.addPage();
      }

      // ---------- PAGE: LENGTH & AREA ----------
      const secNum = hasDiagram ? 2 : 1;
      doc.fillColor(BRAND_RED).rect(leftX, 48, SECTION_BAR_WIDTH, 18).fill();
      doc.fontSize(SECTION_TITLE_FONT).fillColor(BRAND_DARK).text(`${secNum}. Length & area measurement`, leftX + SECTION_BAR_WIDTH + 10, 48);
      doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(address || '—', leftX, 72, { width: CONTENT_WIDTH });

      doc.y = 100;
      const rowH = 26;
      const col1W = 260;
      const tableTop = doc.y;
      doc.fillColor(GRAY_BG).rect(leftX, tableTop, CONTENT_WIDTH, rowH * 4).fill();
      doc.strokeColor(GRAY_BORDER).rect(leftX, tableTop, CONTENT_WIDTH, rowH * 4).stroke();
      doc.fontSize(BODY_FONT).fillColor(BRAND_DARK).text('Eaves / drip edge (perimeter)', leftX + 12, tableTop + 8);
      doc.fillColor(GRAY_TEXT).text(`${fmt(measure.perimeterFt, 0)} ft`, leftX + col1W, tableTop + 8);
      doc.strokeColor(GRAY_BORDER).moveTo(leftX, tableTop + rowH).lineTo(rightEdge, tableTop + rowH).stroke();
      doc.fillColor(BRAND_DARK).text('Roof area (footprint)', leftX + 12, tableTop + rowH + 8);
      doc.fillColor(GRAY_TEXT).text(`${fmt(measure.areaFt2, 0)} sqft`, leftX + col1W, tableTop + rowH + 8);
      doc.strokeColor(GRAY_BORDER).moveTo(leftX, tableTop + rowH * 2).lineTo(rightEdge, tableTop + rowH * 2).stroke();
      doc.fillColor(BRAND_DARK).text('Actual roof area (with pitch)', leftX + 12, tableTop + rowH * 2 + 8);
      doc.fillColor(GRAY_TEXT).text(`${fmt(roofingSummary.actualRoofAreaFt2, 0)} sqft`, leftX + col1W, tableTop + rowH * 2 + 8);
      doc.strokeColor(GRAY_BORDER).moveTo(leftX, tableTop + rowH * 3).lineTo(rightEdge, tableTop + rowH * 3).stroke();
      doc.fillColor(BRAND_DARK).text('Pitch', leftX + 12, tableTop + rowH * 3 + 8);
      doc.fillColor(GRAY_TEXT).text(`${roofingSummary.pitchKey}/12`, leftX + col1W, tableTop + rowH * 3 + 8);
      doc.y = tableTop + rowH * 4 + 20;

      doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(
        'Measurements are based on the drawn polygon in satellite view. Estimate only; verify on site.',
        leftX,
        doc.y,
        { width: CONTENT_WIDTH }
      );
      addFooter(pageNum++, totalPages);
      doc.addPage();

      // ---------- PAGE: REPORT SUMMARY & SQUARES ----------
      const secNum2 = hasDiagram ? 3 : 2;
      doc.fillColor(BRAND_RED).rect(leftX, 48, SECTION_BAR_WIDTH, 18).fill();
      doc.fontSize(SECTION_TITLE_FONT).fillColor(BRAND_DARK).text(`${secNum2}. Report summary & squares by waste`, leftX + SECTION_BAR_WIDTH + 10, 48);
      doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(address || '—', leftX, 72, { width: CONTENT_WIDTH });

      doc.y = 96;
      doc.fontSize(BODY_FONT).fillColor(BRAND_DARK).text('Measurements', leftX, doc.y);
      doc.y += 20;
      doc.fillColor(GRAY_TEXT)
        .text(`Total roof area: ${fmt(measure.areaFt2, 0)} sqft`, leftX, doc.y)
        .text(`Total pitched area: ${fmt(roofingSummary.actualRoofAreaFt2, 0)} sqft`, leftX, doc.y + 16)
        .text(`Predominant pitch: ${roofingSummary.pitchKey}/12`, leftX, doc.y + 32)
        .text(`Total perimeter (drip edge): ${fmt(measure.perimeterFt, 0)} ft`, leftX, doc.y + 48);
      doc.y += 72;

      doc.fontSize(BODY_FONT).fillColor(BRAND_DARK).text('Squares by waste %', leftX, doc.y);
      doc.y += 18;
      const wastePcts = [0, 10, 11, 12, 15, 17, 20];
      const tableColW = 68;
      const tw = 90 + wastePcts.length * tableColW;
      const th = 52;
      doc.fillColor(BRAND_DARK).rect(leftX, doc.y, tw, 18).fill();
      doc.fontSize(9).fillColor('#ffffff');
      doc.text('Waste %', leftX + 10, doc.y + 5);
      wastePcts.forEach((p, i) => doc.text(`${p}%`, leftX + 90 + i * tableColW, doc.y + 5));
      doc.y += 18;
      doc.strokeColor(GRAY_BORDER);
      for (let r = 0; r <= 2; r++) {
        doc.moveTo(leftX, doc.y).lineTo(leftX + tw, doc.y).stroke();
        doc.fillColor(r === 0 ? BRAND_DARK : GRAY_TEXT).fontSize(9);
        doc.text(r === 0 ? 'Area (sqft)' : r === 1 ? 'Squares' : '', leftX + 10, doc.y + 6);
        wastePcts.forEach((p, i) => {
          const val = r === 0
            ? fmt(roofingSummary.actualRoofAreaFt2 * (1 + p / 100), 0)
            : r === 1
              ? fmt((roofingSummary.actualRoofAreaFt2 / 100) * (1 + p / 100), 1)
              : '';
          doc.fillColor(r === 0 ? BRAND_DARK : GRAY_TEXT).text(val, leftX + 90 + i * tableColW, doc.y + 6);
        });
        doc.y += 17;
      }
      doc.moveTo(leftX, doc.y).lineTo(leftX + tw, doc.y).stroke();
      doc.y += 22;
      doc.fontSize(8).fillColor(GRAY_TEXT).text(
        'Recommended waste is based on asphalt shingle roof. Adjust for complexity and application.',
        leftX,
        doc.y,
        { width: CONTENT_WIDTH }
      );
      addFooter(pageNum++, totalPages);
      doc.addPage();

      // ---------- PAGE: MATERIAL CALCULATIONS ----------
      const secNum3 = hasDiagram ? 4 : 3;
      doc.fillColor(BRAND_RED).rect(leftX, 48, SECTION_BAR_WIDTH, 18).fill();
      doc.fontSize(SECTION_TITLE_FONT).fillColor(BRAND_DARK).text(`${secNum3}. Material calculations`, leftX + SECTION_BAR_WIDTH + 10, 48);
      doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(address || '—', leftX, 72, { width: CONTENT_WIDTH });

      doc.y = 98;
      const m = roofingSummary.materials;
      const mRows: [string, string][] = [
        ['Shingles (bundles)', String(m.bundlesShingles)],
        ['Underlayment (rolls)', String(m.underlaymentRolls)],
        ['Nails (lbs)', String(m.nailsLbs)],
        ['Ridge cap (linear ft)', String(m.ridgeCapLinearFt)],
        ['Drip edge (linear ft)', String(m.dripEdgeLinearFt)],
      ];
      const mRowH = 28;
      const mTableH = 20 + mRows.length * mRowH;
      doc.fillColor(BRAND_DARK).rect(leftX, doc.y, CONTENT_WIDTH, 20).fill();
      doc.fontSize(BODY_FONT).fillColor('#ffffff').text('Product', leftX + 12, doc.y + 5);
      doc.text('Quantity', rightEdge - 70, doc.y + 5);
      doc.y += 20;
      doc.strokeColor(GRAY_BORDER).rect(leftX, doc.y - 20, CONTENT_WIDTH, mTableH).stroke();
      mRows.forEach(([label, value], i) => {
        if (i % 2 === 1) doc.fillColor(GRAY_BG).rect(leftX, doc.y, CONTENT_WIDTH, mRowH).fill();
        doc.strokeColor(GRAY_BORDER).moveTo(leftX, doc.y).lineTo(rightEdge, doc.y).stroke();
        doc.fillColor(GRAY_TEXT).text(label, leftX + 12, doc.y + 8);
        doc.fillColor(BRAND_DARK).text(value, rightEdge - 70, doc.y + 8);
        doc.y += mRowH;
      });
      doc.strokeColor(GRAY_BORDER).moveTo(leftX, doc.y).lineTo(rightEdge, doc.y).stroke();
      doc.y += 18;
      doc.fontSize(SMALL_FONT).fillColor(GRAY_TEXT).text(
        'These calculations are estimates. Always verify quantities before ordering.',
        leftX,
        doc.y,
        { width: CONTENT_WIDTH }
      );
      addFooter(pageNum, totalPages);

      doc.end();
    });
  }
}
