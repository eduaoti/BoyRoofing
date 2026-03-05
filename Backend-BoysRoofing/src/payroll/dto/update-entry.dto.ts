export class UpdateEntryDto {
  fullDays?: number;
  halfDays?: number;
  dayRate?: number;
  halfDayRate?: number;
  bonuses?: number;
  deductions?: number;
  notes?: string;
  amountPaid?: number;
  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';
  paidAt?: string | null; // ISO date
}
