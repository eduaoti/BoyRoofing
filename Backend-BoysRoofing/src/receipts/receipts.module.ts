import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [MailModule, AuthModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, PrismaService],
})
export class ReceiptsModule {}
