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
  /**
   * Estados de días trabajados para este registro.
   * Se envía como lista para simplificar el manejo en el backend.
   */
  workDays?: {
    date: string; // YYYY-MM-DD
    type: 'FULL' | 'HALF' | 'OFF';
  }[];
}
