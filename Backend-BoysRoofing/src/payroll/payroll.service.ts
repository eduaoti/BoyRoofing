import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { AddOccasionalDto } from './dto/add-occasional.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { WorkerType, PaymentStatus, PayrollPeriodStatus } from '@prisma/client';

function calcTotal(
  fullDays: number,
  halfDays: number,
  dayRate: number,
  halfDayRate: number,
  bonuses: number,
  deductions: number,
): number {
  return fullDays * dayRate + halfDays * halfDayRate + (bonuses || 0) - (deductions || 0);
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async listPeriods() {
    return this.prisma.payrollPeriod.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        entries: true,
      },
    });
  }

  async getPeriod(id: number) {
    return this.prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        entries: {
          include: { worker: true },
          orderBy: [{ workerType: 'asc' }, { workerName: 'asc' }, { worker: { name: 'asc' } }],
        },
      },
    });
  }

  async deletePeriod(id: number) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id } });
    if (!period) throw new Error('Period not found');
    await this.prisma.payrollPeriod.delete({ where: { id } });
    return { ok: true };
  }

  async createPeriod(dto: CreatePeriodDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const activeWorkers = await this.prisma.worker.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const period = await this.prisma.payrollPeriod.create({
      data: {
        startDate: start,
        endDate: end,
        label: dto.label ?? null,
        status: PayrollPeriodStatus.DRAFT,
      },
    });

    for (const w of activeWorkers) {
      const dayRate = w.defaultDayRate;
      const halfDayRate = dayRate / 2;
      const total = 0;
      const prevBalance = w.balance;
      await this.prisma.payrollEntry.create({
        data: {
          payrollPeriodId: period.id,
          workerType: WorkerType.REGULAR,
          workerId: w.id,
          workerName: w.name,
          fullDays: 0,
          halfDays: 0,
          dayRate,
          halfDayRate,
          bonuses: 0,
          deductions: 0,
          total,
          prevBalance,
          amountPaid: 0,
          balanceAfter: prevBalance,
          paymentStatus: PaymentStatus.UNPAID,
        },
      });
    }

    return this.getPeriod(period.id);
  }

  async updateEntry(entryId: number, dto: UpdateEntryDto) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id: entryId },
      include: { worker: true, payrollPeriod: true },
    });
    if (!entry) throw new Error('Entry not found');

    const fullDays = dto.fullDays ?? entry.fullDays;
    const halfDays = dto.halfDays ?? entry.halfDays;
    const dayRate = dto.dayRate ?? entry.dayRate;
    const halfDayRate = dto.halfDayRate ?? entry.halfDayRate;
    const bonuses = dto.bonuses ?? entry.bonuses;
    const deductions = dto.deductions ?? entry.deductions;
    const total = calcTotal(fullDays, halfDays, dayRate, halfDayRate, bonuses, deductions);
    const prevBalance = entry.prevBalance;
    const amountPaid = dto.amountPaid ?? entry.amountPaid;
    const balanceAfter = prevBalance + total - amountPaid;

    let paymentStatus = entry.paymentStatus;
    if (dto.paymentStatus) paymentStatus = dto.paymentStatus as PaymentStatus;
    else {
      if (balanceAfter <= -0.01) paymentStatus = PaymentStatus.PAID; // overpaid
      else if (amountPaid > 0) paymentStatus = PaymentStatus.PARTIAL;
      else paymentStatus = PaymentStatus.UNPAID;
    }

    const updated = await this.prisma.payrollEntry.update({
      where: { id: entryId },
      data: {
        fullDays,
        halfDays,
        dayRate,
        halfDayRate,
        bonuses,
        deductions,
        notes: dto.notes !== undefined ? dto.notes : entry.notes,
        total,
        amountPaid,
        balanceAfter,
        paymentStatus,
        paidAt: dto.paidAt !== undefined ? (dto.paidAt ? new Date(dto.paidAt) : null) : entry.paidAt,
      },
    });

    if (entry.workerId) {
      await this.prisma.worker.update({
        where: { id: entry.workerId },
        data: { balance: balanceAfter },
      });
    }
    return updated;
  }

  async markPaid(entryId: number, dto: MarkPaidDto) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id: entryId },
      include: { worker: true },
    });
    if (!entry) throw new Error('Entry not found');

    const amountPaid = dto.amountPaid;
    const balanceAfter = entry.prevBalance + entry.total - amountPaid;
    const paymentStatus: PaymentStatus = Math.abs(balanceAfter) < 0.01 ? PaymentStatus.PAID : amountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

    const updated = await this.prisma.payrollEntry.update({
      where: { id: entryId },
      data: {
        amountPaid,
        balanceAfter,
        paymentStatus,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
    });

    if (entry.workerId) {
      await this.prisma.worker.update({
        where: { id: entry.workerId },
        data: { balance: balanceAfter },
      });
    }
    return updated;
  }

  async markFullPaid(entryId: number) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id: entryId },
      include: { worker: true },
    });
    if (!entry) throw new Error('Entry not found');
    const amountToPay = entry.prevBalance + entry.total;
    return this.markPaid(entryId, { amountPaid: amountToPay });
  }

  async addOccasional(dto: AddOccasionalDto) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: dto.payrollPeriodId },
    });
    if (!period) throw new Error('Period not found');

    const halfDayRate = dto.halfDayRate ?? dto.dayRate / 2;
    const total = calcTotal(
      dto.fullDays,
      dto.halfDays,
      dto.dayRate,
      halfDayRate,
      dto.bonuses ?? 0,
      dto.deductions ?? 0,
    );

    return this.prisma.payrollEntry.create({
      data: {
        payrollPeriodId: dto.payrollPeriodId,
        workerType: WorkerType.OCCASIONAL,
        workerName: dto.workerName,
        fullDays: dto.fullDays,
        halfDays: dto.halfDays,
        dayRate: dto.dayRate,
        halfDayRate,
        bonuses: dto.bonuses ?? 0,
        deductions: dto.deductions ?? 0,
        notes: dto.notes ?? null,
        total,
        prevBalance: 0,
        amountPaid: 0,
        balanceAfter: total,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });
  }

  async updatePeriodStatus(periodId: number, status: PayrollPeriodStatus) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { entries: true },
    });
    if (!period) throw new Error('Period not found');

    let totalPaid: number | null = null;
    if (status === PayrollPeriodStatus.PAID || status === PayrollPeriodStatus.CLOSED) {
      totalPaid = period.entries.reduce((s, e) => s + e.amountPaid, 0);
    }

    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status, totalPaid },
    });
  }

  async deleteEntry(entryId: number) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id: entryId },
      include: { worker: true },
    });
    if (!entry) throw new Error('Entry not found');
    if (entry.workerId) {
      await this.prisma.worker.update({
        where: { id: entry.workerId },
        data: { balance: entry.prevBalance },
      });
    }
    return this.prisma.payrollEntry.delete({ where: { id: entryId } });
  }

  /** Añade un trabajador ya registrado (plantilla) al periodo. */
  async addWorkerToPeriod(periodId: number, workerId: number) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { entries: true },
    });
    if (!period) throw new Error('Period not found');

    const existing = period.entries.some((e) => e.workerId === workerId);
    if (existing) throw new Error('Worker already in this period');

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new Error('Worker not found');
    if (!worker.isActive) throw new Error('Worker is inactive');

    const dayRate = worker.defaultDayRate;
    const halfDayRate = dayRate / 2;
    const total = 0;
    const prevBalance = worker.balance;

    await this.prisma.payrollEntry.create({
      data: {
        payrollPeriodId: period.id,
        workerType: WorkerType.REGULAR,
        workerId: worker.id,
        workerName: worker.name,
        fullDays: 0,
        halfDays: 0,
        dayRate,
        halfDayRate,
        bonuses: 0,
        deductions: 0,
        total,
        prevBalance,
        amountPaid: 0,
        balanceAfter: prevBalance,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    return this.getPeriod(periodId);
  }
}
