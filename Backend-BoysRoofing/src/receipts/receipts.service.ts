import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paymentReceipt.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.paymentReceipt.findUnique({
      where: { id },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async getNextReceiptNumber(): Promise<string> {
    const last = await this.prisma.paymentReceipt.findFirst({
      orderBy: { id: 'desc' },
      select: { receiptNumber: true },
    });
    if (!last) return 'REC-0001';
    const match = last.receiptNumber.replace(/\s/g, '').match(/REC-?(\d+)/i);
    const num = match ? parseInt(match[1], 10) + 1 : 1;
    return `REC-${String(num).padStart(4, '0')}`;
  }

  async create(dto: {
    date: string;
    clientName: string;
    clientEmail?: string;
    amount: number;
    concept: string;
    notes?: string;
  }) {
    const receiptNumber = await this.getNextReceiptNumber();
    const date = new Date(dto.date);
    return this.prisma.paymentReceipt.create({
      data: {
        receiptNumber,
        date,
        clientName: dto.clientName.trim(),
        clientEmail: dto.clientEmail?.trim() || null,
        amount: Number(dto.amount),
        concept: dto.concept.trim(),
        notes: dto.notes?.trim() || null,
      },
    });
  }

  async updateClientEmail(id: number, clientEmail: string | null) {
    return this.prisma.paymentReceipt.update({
      where: { id },
      data: { clientEmail: clientEmail?.trim() || null },
    });
  }

  async remove(id: number) {
    return this.prisma.paymentReceipt.delete({ where: { id } });
  }
}
