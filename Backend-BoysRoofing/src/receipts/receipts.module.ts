import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MailModule, AuthModule],
  controllers: [ReceiptsController],
})
export class ReceiptsModule {}
