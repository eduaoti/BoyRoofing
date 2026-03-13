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

      const addFooter = (pageNum: number, total: number) => {
        doc.fontSize(8).fillColor(GRAY_TEXT);
        doc.text(
          `This report was prepared by Boy's Roofing. © ${new Date().getFullYear()} Boy's Roofing. All rights reserved. ${pageNum} of ${total}`,
          leftX,
          PAGE_HEIGHT - 28,
          { width: CONTENT_WIDTH, align: 'center' }
        );
      };

      const totalPages = polygon && polygon.length >= 3 ? 6 : 5;
      let pageNum = 1;

      // ========== PAGE 1: COVER ==========
      doc.fillColor(BRAND_DARK).rect(0, 0, PAGE_WIDTH, 120).fill();
      doc.fontSize(28).fillColor('#ffffff').text("BOY'S ROOFING", leftX, 28, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      doc.fontSize(14).fillColor(BRAND_PEARL).text('Roof Report', leftX, 58, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      doc.fontSize(10).fillColor('#ffffff').text(`${fmt(measure.areaFt2, 0)} sqft  •  Predominant pitch ${roofingSummary.pitchKey}/12`, leftX, 88, {
        width: CONTENT_WIDTH,
        align: 'center',
      });

      doc.y = 140;
      doc.fontSize(12).fillColor(BRAND_DARK).text(address || '—', leftX, doc.y, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      doc.y += 24;
      doc.fontSize(10).fillColor(GRAY_TEXT).text(`Report date: ${new Date().toLocaleDateString()}`, leftX, doc.y, {
        width: CONTENT_WIDTH,
        align: 'center',
      });
      doc.y += 60;

      doc.fillColor(GRAY_BG).roundedRect(leftX, doc.y, CONTENT_WIDTH, 70, 8).fill();
      doc.strokeColor(GRAY_BORDER).roundedRect(leftX, doc.y, CONTENT_WIDTH, 70, 8).stroke();
      doc.fontSize(10).fillColor(BRAND_DARK).text('Summary', leftX + 14, doc.y + 12);
      doc.fontSize(11).fillColor(BRAND_RED).text(`Total roof area: ${fmt(measure.areaFt2, 0)} sqft`, leftX + 14, doc.y + 28);
      doc.text(`Squares (to order): ${fmt(roofingSummary.squaresWithWaste, 2)}`, leftX + 14, doc.y + 44);
      doc.text(`Perimeter (drip edge): ${fmt(measure.perimeterFt, 0)} ft`, leftX + 14, doc.y + 60);

      addFooter(pageNum++, totalPages);
      doc.addPage();

      // ========== PAGE 2: DIAGRAM (if polygon) ==========
      if (polygon && polygon.length >= 3) {
        doc.fontSize(14).fillColor(BRAND_DARK).text('Diagram', leftX, 50);
        doc.fontSize(10).fillColor(GRAY_TEXT).text(address || '—', leftX, 68, { width: CONTENT_WIDTH });

        const diagramTop = 100;
        const diagramSize = Math.min(400, CONTENT_WIDTH, PAGE_HEIGHT - diagramTop - 80);
        const [minLng, maxLng] = [Math.min(...polygon.map((p) => p[0])), Math.max(...polygon.map((p) => p[0]))];
        const [minLat, maxLat] = [Math.min(...polygon.map((p) => p[1])), Math.max(...polygon.map((p) => p[1]))];
        const rangeLng = maxLng - minLng || 0.0001;
        const rangeLat = maxLat - minLat || 0.0001;
        const pad = 0.15;
        const scaleX = (diagramSize * (1 - 2 * pad)) / rangeLng;
        const scaleY = (diagramSize * (1 - 2 * pad)) / rangeLat;
        const scale = Math.min(scaleX, scaleY);
        const cx = (minLng + maxLng) / 2;
        const cy = (minLat + maxLat) / 2;
        const toX = (lng: number) => leftX + diagramSize / 2 + (lng - cx) * scale;
        const toY = (lat: number) => diagramTop + diagramSize / 2 - (lat - cy) * scale;

        const pts = polygon;
        doc.moveTo(toX(pts[0][0]), toY(pts[0][1]));
        for (let i = 1; i < pts.length; i++) doc.lineTo(toX(pts[i][0]), toY(pts[i][1]));
        doc.closePath();
        doc.fillColor(BRAND_RED).opacity(0.3).strokeColor(BRAND_RED_LIGHT).lineWidth(2).fillAndStroke();
        doc.opacity(1);

        doc.fontSize(9).fillColor(GRAY_TEXT).text(
          'Roof outline from satellite measurement. Verify on site.',
          leftX,
          diagramTop + diagramSize + 16,
          { width: CONTENT_WIDTH }
        );
        addFooter(pageNum++, totalPages);
        doc.addPage();
      }

      // ========== PAGE: LENGTH / AREA MEASUREMENT ==========
      doc.fontSize(14).fillColor(BRAND_DARK).text('Length & area measurement', leftX, 50);
      doc.fontSize(10).fillColor(GRAY_TEXT).text(address || '—', leftX, 68, { width: CONTENT_WIDTH });

      doc.y = 100;
      const rowH = 28;
      const col1W = 220;
      doc.fontSize(10).fillColor(BRAND_DARK).text('Eaves / Drip edge (perimeter):', leftX, doc.y);
      doc.fillColor(GRAY_TEXT).text(`${fmt(measure.perimeterFt, 0)} ft`, leftX + col1W, doc.y);
      doc.y += rowH;
      doc.fillColor(BRAND_DARK).text('Roof area (footprint):', leftX, doc.y);
      doc.fillColor(GRAY_TEXT).text(`${fmt(measure.areaFt2, 0)} sqft`, leftX + col1W, doc.y);
      doc.y += rowH;
      doc.fillColor(BRAND_DARK).text('Actual roof area (with pitch):', leftX, doc.y);
      doc.fillColor(GRAY_TEXT).text(`${fmt(roofingSummary.actualRoofAreaFt2, 0)} sqft`, leftX + col1W, doc.y);
      doc.y += rowH;
      doc.fillColor(BRAND_DARK).text('Pitch:', leftX, doc.y);
      doc.fillColor(GRAY_TEXT).text(`${roofingSummary.pitchKey}/12`, leftX + col1W, doc.y);
      doc.y += rowH * 2;

      doc.fontSize(9).fillColor(GRAY_TEXT).text(
        'Measurements are based on the drawn polygon in satellite view. * Estimate by satellite. Verify on site.',
        leftX,
        doc.y,
        { width: CONTENT_WIDTH }
      );
      addFooter(pageNum++, totalPages);
      doc.addPage();

      // ========== PAGE: REPORT SUMMARY ==========
      doc.fontSize(14).fillColor(BRAND_DARK).text('Report summary', leftX, 50);
      doc.fontSize(10).fillColor(GRAY_TEXT).text(address || '—', leftX, 68, { width: CONTENT_WIDTH });

      doc.y = 100;
      doc.fontSize(10);
      doc.fillColor(BRAND_DARK).text('Measurements', leftX, doc.y);
      doc.y += 20;
      doc.fillColor(GRAY_TEXT)
        .text(`Total roof area: ${fmt(measure.areaFt2, 0)} sqft`, leftX, doc.y)
        .text(`Total pitched area: ${fmt(roofingSummary.actualRoofAreaFt2, 0)} sqft`, leftX, doc.y + 18)
        .text(`Predominant pitch: ${roofingSummary.pitchKey}/12`, leftX, doc.y + 36)
        .text(`Total perimeter (drip edge): ${fmt(measure.perimeterFt, 0)} ft`, leftX, doc.y + 54);
      doc.y += 80;

      doc.fillColor(BRAND_DARK).text('Squares by waste', leftX, doc.y);
      doc.y += 22;
      const wastePcts = [0, 10, 11, 12, 15, 17, 20];
      const tableColW = 70;
      doc.fontSize(9).fillColor(BRAND_DARK);
      doc.text('Waste %', leftX, doc.y);
      wastePcts.forEach((p, i) => doc.text(`${p}%`, leftX + 90 + i * tableColW, doc.y));
      doc.y += 16;
      doc.strokeColor(GRAY_BORDER).moveTo(leftX, doc.y).lineTo(rightEdge, doc.y).stroke();
      doc.y += 10;
      doc.fillColor(GRAY_TEXT);
      const areaWithWaste = roofingSummary.actualRoofAreaFt2 * (1 + roofingSummary.wastePercent / 100);
      const sqWithWaste = areaWithWaste / 100;
      doc.text('Area (sqft)', leftX, doc.y);
      wastePcts.forEach((p, i) => {
        const a = roofingSummary.actualRoofAreaFt2 * (1 + p / 100);
        doc.text(fmt(a, 0), leftX + 90 + i * tableColW, doc.y);
      });
      doc.y += 16;
      doc.text('Squares', leftX, doc.y);
      wastePcts.forEach((p, i) => {
        const sq = (roofingSummary.actualRoofAreaFt2 / 100) * (1 + p / 100);
        doc.text(fmt(sq, 1), leftX + 90 + i * tableColW, doc.y);
      });
      doc.y += 24;
      doc.fontSize(8).fillColor(GRAY_TEXT).text(
        'Recommended waste is based on asphalt shingle roof. Adjust for complexity and application style.',
        leftX,
        doc.y,
        { width: CONTENT_WIDTH }
      );
      addFooter(pageNum++, totalPages);
      doc.addPage();

      // ========== PAGE: MATERIAL CALCULATIONS ==========
      doc.fontSize(14).fillColor(BRAND_DARK).text('Material calculations', leftX, 50);
      doc.fontSize(10).fillColor(GRAY_TEXT).text(address || '—', leftX, 68, { width: CONTENT_WIDTH });

      doc.y = 95;
      const m = roofingSummary.materials;
      doc.fontSize(10).fillColor(BRAND_DARK).text('Product', leftX, doc.y);
      doc.text('Quantity', rightEdge - 80, doc.y);
      doc.y += 6;
      doc.strokeColor(GRAY_BORDER).moveTo(leftX, doc.y).lineTo(rightEdge, doc.y).stroke();
      doc.y += 14;

      const materialRows: [string, string][] = [
        ['Shingles (bundles)', String(m.bundlesShingles)],
        ['Underlayment (rolls)', String(m.underlaymentRolls)],
        ['Nails (lbs)', String(m.nailsLbs)],
        ['Ridge cap (linear ft)', String(m.ridgeCapLinearFt)],
        ['Drip edge (linear ft)', String(m.dripEdgeLinearFt)],
      ];
      materialRows.forEach(([label, value]) => {
        doc.fontSize(10).fillColor(GRAY_TEXT).text(label, leftX, doc.y);
        doc.fillColor(BRAND_DARK).text(value, rightEdge - 80, doc.y);
        doc.y += 22;
      });

      doc.y += 10;
      doc.fontSize(9).fillColor(GRAY_TEXT).text(
        'These calculations are estimates. Always verify before ordering. Based on pitched area and selected waste %.',
        leftX,
        doc.y,
        { width: CONTENT_WIDTH }
      );
      addFooter(pageNum, totalPages);

      doc.end();
    });
  }
}
