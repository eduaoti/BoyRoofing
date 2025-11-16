import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { PrismaService } from 'src/prisma.service';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [MailModule, AuthModule],
  controllers: [QuotesController],
  providers: [QuotesService, PrismaService],  
})
export class QuotesModule {}
