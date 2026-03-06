import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateInvoiceDto, @Res() res: any) {
    const { invoice, pdfBuffer } = await this.invoicesService.create(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
    });

    return res.send(pdfBuffer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('quote/:quoteId')
  async deleteByQuoteId(@Param('quoteId', ParseIntPipe) quoteId: number) {
    return this.invoicesService.deleteByQuoteId(quoteId);
  }
}
