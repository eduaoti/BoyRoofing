import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';


@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) { }

  // Ruta específica primero para que no la pise ningún param
  @UseGuards(JwtAuthGuard)
  @Post('for-invoice')
  createForInvoice(@Body() data: CreateQuoteDto) {
    return this.quotesService.createForInvoice(data);
  }

  @Post()
  create(@Body() data: CreateQuoteDto) {
    return this.quotesService.create(data);
  }

  // 🛡 proteger ruta GET /quotes
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  // 🛡 proteger ruta GET /quotes/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }

}
