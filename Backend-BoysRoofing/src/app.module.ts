import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { QuotesModule } from './quotes/quotes.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { InvoicesModule } from './invoices/invoices.module'; // 👈 nuevo import
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    QuotesModule,
    MailModule,
    AuthModule,
    InvoicesModule, // 👈 aquí conectas el módulo de invoices
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
