import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PayrollService } from './payroll.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { AddOccasionalDto } from './dto/add-occasional.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { PayrollPeriodStatus } from '@prisma/client';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('periods')
  listPeriods() {
    return this.payrollService.listPeriods();
  }

  @Get('periods/:id')
  getPeriod(@Param('id') id: string) {
    return this.payrollService.getPeriod(+id);
  }

  @Delete('periods/:id')
  deletePeriod(@Param('id') id: string) {
    return this.payrollService.deletePeriod(+id);
  }

  @Post('periods')
  createPeriod(@Body() dto: CreatePeriodDto) {
    return this.payrollService.createPeriod(dto);
  }

  @Post('periods/:id/add-worker')
  addWorkerToPeriod(
    @Param('id') id: string,
    @Body('workerId') workerId: number,
  ) {
    return this.payrollService.addWorkerToPeriod(+id, workerId);
  }

  @Patch('periods/:id/status')
  updatePeriodStatus(
    @Param('id') id: string,
    @Body('status') status: PayrollPeriodStatus,
  ) {
    return this.payrollService.updatePeriodStatus(+id, status);
  }

  @Patch('entries/:id')
  updateEntry(@Param('id') id: string, @Body() dto: UpdateEntryDto) {
    return this.payrollService.updateEntry(+id, dto);
  }

  @Post('entries/:id/mark-paid')
  markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto) {
    return this.payrollService.markPaid(+id, dto);
  }

  @Post('entries/:id/mark-full-paid')
  markFullPaid(@Param('id') id: string) {
    return this.payrollService.markFullPaid(+id);
  }

  @Post('entries/occasional')
  addOccasional(@Body() dto: AddOccasionalDto) {
    return this.payrollService.addOccasional(dto);
  }

  @Delete('entries/:id')
  deleteEntry(@Param('id') id: string) {
    return this.payrollService.deleteEntry(+id);
  }
}
