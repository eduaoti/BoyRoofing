import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, PrismaService],
})
export class PayrollModule {}
