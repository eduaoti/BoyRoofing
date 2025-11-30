export class CreateInvoiceDto {
  quoteId: number;

  billTo: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyLocation: string;

  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD desde el front

  description: string;
  price: number;
  subtotal: number;
  other?: number;
  total: number;
}
