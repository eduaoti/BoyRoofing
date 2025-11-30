import { Module } from '@nestjs/common';
import { InvoicesController } from './ invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MailModule, AuthModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService],
})
export class InvoicesModule {}
