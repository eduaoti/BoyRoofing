export class UpdateWorkerDto {
  name?: string;
  phone?: string;
  role?: string;
  defaultDayRate?: number;
  isActive?: boolean;
  balance?: number; // ajuste manual desde Deudas/Balances
}
