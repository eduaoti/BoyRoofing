export class CreateWorkerDto {
  name: string;
  phone?: string;
  role?: string;
  defaultDayRate: number;
  isActive?: boolean;
}
