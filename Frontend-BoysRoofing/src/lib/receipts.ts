// Payment receipts — stored in localStorage (shared EN/ES)

const STORAGE_KEY = "br_receipts";

export type PaymentReceipt = {
  id: string;
  receiptNumber: string;
  date: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  concept: string;
  notes?: string;
  createdAt: string;
};

function loadReceipts(): PaymentReceipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveReceipts(receipts: PaymentReceipt[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function getAllReceipts(): PaymentReceipt[] {
  return loadReceipts().sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export function getNextReceiptNumber(): string {
  const receipts = loadReceipts();
  const numbers = receipts
    .map((r) => {
      const match = r.receiptNumber.replace(/\s/g, "").match(/REC-?(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `REC-${String(next).padStart(4, "0")}`;
}

export function createReceipt(input: Omit<PaymentReceipt, "id" | "receiptNumber" | "createdAt">): PaymentReceipt {
  const receipts = loadReceipts();
  const receiptNumber = getNextReceiptNumber();
  const receipt: PaymentReceipt = {
    id: crypto.randomUUID?.() ?? `rec-${Date.now()}`,
    receiptNumber,
    date: input.date,
    clientName: input.clientName.trim(),
    clientEmail: input.clientEmail?.trim() || undefined,
    amount: Number(input.amount) || 0,
    concept: input.concept.trim(),
    notes: input.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  receipts.push(receipt);
  saveReceipts(receipts);
  return receipt;
}

export function getReceiptById(id: string): PaymentReceipt | undefined {
  return loadReceipts().find((r) => r.id === id);
}

export function updateReceipt(id: string, patch: Partial<Pick<PaymentReceipt, "clientEmail">>): PaymentReceipt | undefined {
  const receipts = loadReceipts();
  const idx = receipts.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  if (patch.clientEmail !== undefined) receipts[idx].clientEmail = patch.clientEmail.trim() || undefined;
  saveReceipts(receipts);
  return receipts[idx];
}

export function deleteReceipt(id: string): boolean {
  const receipts = loadReceipts().filter((r) => r.id !== id);
  if (receipts.length === loadReceipts().length) return false;
  saveReceipts(receipts);
  return true;
}
