// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { QuotesModule } from './quotes/quotes.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReviewsModule } from './Reviews/reviews.module';
import { WorkersModule } from './workers/workers.module';
import { PayrollModule } from './payroll/payroll.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { SiteImagesModule } from './site-images/site-images.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    QuotesModule,
    MailModule,
    AuthModule,
    InvoicesModule,
    ReviewsModule,
    WorkersModule,
    PayrollModule,
    ReceiptsModule,
    SiteImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
