import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuotesModule } from './quotes/quotes.module';
import { PrismaService } from './prisma.service';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [QuotesModule, MailModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
