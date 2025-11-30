// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { QuotesModule } from './quotes/quotes.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReviewsModule } from './Reviews/reviews.module'; // 👈 AQUI
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    QuotesModule,
    MailModule,
    AuthModule,
    InvoicesModule,
    ReviewsModule, // 👈 Y AQUI
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
