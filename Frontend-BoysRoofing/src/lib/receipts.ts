// Payment receipts — persisted in backend (synced across devices)

import { apiFetch } from "./api";

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

function mapReceipt(r: {
  id: number;
  receiptNumber: string;
  date: string | Date;
  clientName: string;
  clientEmail?: string | null;
  amount: number;
  concept: string;
  notes?: string | null;
  createdAt: string | Date;
}): PaymentReceipt {
  return {
    id: String(r.id),
    receiptNumber: r.receiptNumber,
    date: typeof r.date === "string" ? r.date.slice(0, 10) : r.date.toISOString().slice(0, 10),
    clientName: r.clientName,
    clientEmail: r.clientEmail ?? undefined,
    amount: r.amount,
    concept: r.concept,
    notes: r.notes ?? undefined,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : r.createdAt.toISOString(),
  };
}

export async function getAllReceipts(): Promise<PaymentReceipt[]> {
  const res = await apiFetch("/receipts");
  if (res.status === 401) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error("Failed to fetch receipts");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(mapReceipt);
}

export async function getNextReceiptNumber(): Promise<string> {
  const res = await apiFetch("/receipts/next-number");
  if (!res.ok) return "REC-0001";
  const data = await res.json();
  return typeof data === "string" ? data : "REC-0001";
}

export async function createReceipt(input: Omit<PaymentReceipt, "id" | "receiptNumber" | "createdAt">): Promise<PaymentReceipt> {
  const res = await apiFetch("/receipts", {
    method: "POST",
    body: JSON.stringify({
      date: input.date,
      clientName: input.clientName.trim(),
      clientEmail: input.clientEmail?.trim() || undefined,
      amount: Number(input.amount),
      concept: input.concept.trim(),
      notes: input.notes?.trim() || undefined,
    }),
  });
  if (res.status === 401) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create receipt");
  }
  const data = await res.json();
  return mapReceipt(data);
}

export async function getReceiptById(id: string): Promise<PaymentReceipt | undefined> {
  const res = await apiFetch(`/receipts/${id}`);
  if (!res.ok) return undefined;
  const data = await res.json();
  return mapReceipt(data);
}

export type ReceiptUpdatePayload = Partial<
  Pick<PaymentReceipt, "date" | "clientName" | "clientEmail" | "amount" | "concept" | "notes">
>;

export async function updateReceipt(id: string, patch: ReceiptUpdatePayload): Promise<PaymentReceipt | undefined> {
  const body: Record<string, unknown> = {};
  if (patch.date !== undefined) body.date = patch.date;
  if (patch.clientName !== undefined) body.clientName = patch.clientName;
  if (patch.clientEmail !== undefined) body.clientEmail = patch.clientEmail ?? null;
  if (patch.amount !== undefined) body.amount = patch.amount;
  if (patch.concept !== undefined) body.concept = patch.concept;
  if (patch.notes !== undefined) body.notes = patch.notes ?? null;
  const res = await apiFetch(`/receipts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(Object.keys(body).length ? body : { clientEmail: null }),
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return mapReceipt(data);
}

export async function deleteReceipt(id: string): Promise<boolean> {
  const res = await apiFetch(`/receipts/${id}`, { method: "DELETE" });
  return res.ok;
}
