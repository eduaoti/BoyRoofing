export class CreateQuoteDto {
  name: string;
  email: string;
  phone: string;
  service: string;
  message?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyLocation: string;
  // status: QuoteStatus;  // Añadimos el campo 'status' que es de tipo QuoteStatus
}
