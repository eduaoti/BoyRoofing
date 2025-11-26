"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useTranslation from "@/hooks/useTranslation";

export default function QuoteDetailES() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadQuote() {
    const token = localStorage.getItem("br_admin_token");

    const res = await fetch(`http://localhost:3200/quotes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const data = await res.json();
    setQuote(data);
    setLoading(false);
  }

  useEffect(() => {
    loadQuote();
  }, []);

  async function deleteQuote() {
    if (!confirm(t("admin.quoteDetail.confirmDelete"))) return;

    const token = localStorage.getItem("br_admin_token");

    await fetch(`http://localhost:3200/quotes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    router.push("/admin/es/quotes");
  }

  if (loading) return <p className="text-br-white/60">Cargando...</p>;

  return (
    <div className="bg-br-smoke/20 p-8 rounded-xl border border-br-smoke-light shadow-lg max-w-3xl">
      <h1 className="text-3xl font-bold text-br-red-main mb-6">
        {t("admin.quoteDetail.title")}
      </h1>

      <div className="space-y-4 text-sm">
        <p><strong>{t("admin.quoteDetail.name")}:</strong> {quote.name}</p>
        <p><strong>{t("admin.quoteDetail.email")}:</strong> {quote.email}</p>
        <p><strong>{t("admin.quoteDetail.phone")}:</strong> {quote.phone}</p>
        <p><strong>{t("admin.quoteDetail.service")}:</strong> {quote.service}</p>
        <p><strong>{t("admin.quoteDetail.message")}:</strong> {quote.message}</p>
        <p><strong>{t("admin.quoteDetail.date")}:</strong> {new Date(quote.createdAt).toLocaleString()}</p>
        <p><strong>{t("admin.quoteDetail.status")}:</strong> {quote.status}</p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => router.push("/admin/es/quotes")}
          className="px-5 py-2 rounded bg-br-smoke text-br-white hover:bg-br-smoke-light transition"
        >
          {t("admin.quoteDetail.back")}
        </button>

        <button
          onClick={deleteQuote}
          className="px-5 py-2 rounded bg-br-red-main hover:bg-br-red-light transition"
        >
          {t("admin.quoteDetail.delete")}
        </button>
      </div>
    </div>
  );
}
