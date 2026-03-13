import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RoofReportService } from './roof-report.service';
import { GenerateRoofReportDto } from './dto/generate-roof-report.dto';

@Controller('roof-report')
@UseGuards(JwtAuthGuard)
export class RoofReportController {
  constructor(private readonly roofReportService: RoofReportService) {}

  @Post('pdf')
  async generatePdf(@Body() dto: GenerateRoofReportDto) {
    const pdfBuffer = await this.roofReportService.generatePdf(dto);
    const addressSlug = (dto.address || 'roof-report')
      .replace(/[^a-zA-Z0-9\s,-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    const filename = `boys-roofing-report-${addressSlug}.pdf`;
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
