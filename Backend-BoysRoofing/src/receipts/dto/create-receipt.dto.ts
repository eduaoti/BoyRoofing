export class CreateReceiptDto {
  date: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  concept: string;
  notes?: string;
  totalPrice?: number;
  jobReference?: string;
}
