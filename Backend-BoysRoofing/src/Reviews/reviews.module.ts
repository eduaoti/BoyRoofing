import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ReviewsController],
  providers: [PrismaService],
})
export class ReviewsModule {}
