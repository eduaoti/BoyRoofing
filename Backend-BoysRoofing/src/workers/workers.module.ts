import { Module } from '@nestjs/common';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkersController],
  providers: [WorkersService, PrismaService],
})
export class WorkersModule {}
