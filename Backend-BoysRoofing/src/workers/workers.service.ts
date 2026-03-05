import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly?: boolean) {
    const where = activeOnly === true ? { isActive: true } : {};
    return this.prisma.worker.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.worker.findUnique({
      where: { id },
      include: { payrollEntries: { include: { payrollPeriod: true }, orderBy: { payrollPeriod: { startDate: 'desc' } }, take: 20 } },
    });
  }

  async create(dto: CreateWorkerDto) {
    return this.prisma.worker.create({
      data: {
        name: dto.name,
        phone: dto.phone ?? null,
        role: dto.role ?? null,
        defaultDayRate: dto.defaultDayRate ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateWorkerDto) {
    return this.prisma.worker.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone || null }),
        ...(dto.role !== undefined && { role: dto.role || null }),
        ...(dto.defaultDayRate != null && { defaultDayRate: dto.defaultDayRate }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.balance !== undefined && { balance: dto.balance }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.worker.delete({ where: { id } });
  }

  /** Lista de trabajadores con balance distinto de 0 (para Deudas/Balances) */
  async withBalance(filter?: 'owe_me' | 'i_owe') {
    const workers = await this.prisma.worker.findMany({
      where: { balance: { not: 0 } },
      orderBy: { name: 'asc' },
    });
    if (filter === 'owe_me') return workers.filter((w) => w.balance < 0);
    if (filter === 'i_owe') return workers.filter((w) => w.balance > 0);
    return workers;
  }
}
