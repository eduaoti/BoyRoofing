export class AddOccasionalDto {
  payrollPeriodId: number;
  workerName: string;
  phone?: string;
  fullDays: number;
  halfDays: number;
  dayRate: number;
  halfDayRate?: number;
  bonuses?: number;
  deductions?: number;
  notes?: string;
}
