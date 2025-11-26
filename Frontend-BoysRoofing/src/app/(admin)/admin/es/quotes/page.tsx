"use client";

import { useEffect, useState } from "react";
import useTranslation from "@/hooks/useTranslation";

export default function QuotesES() {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      const token = localStorage.getItem("br_admin_token");

      const res = await fetch("http://localhost:3200/quotes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Error loading quotes");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setQuotes(data);
      setLoading(false);
    }

    loadQuotes();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-br-red-main mb-6">
        {t("admin.quotes.title")}
      </h1>

      {loading ? (
        <p className="text-br-white/60">Cargando...</p>
      ) : (
        <div className="rounded-xl border border-br-smoke bg-br-smoke/30 p-6 shadow-lg">
          <table className="w-full text-sm">
            <thead className="border-b border-br-smoke-light text-br-red-light">
              <tr>
                <th className="py-2">{t("admin.quotes.table.name")}</th>
                <th className="py-2">{t("admin.quotes.table.email")}</th>
                <th className="py-2">{t("admin.quotes.table.service")}</th>
                <th className="py-2">{t("admin.quotes.table.date")}</th>
                <th className="py-2">{t("admin.quotes.table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {quotes.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-br-smoke-light/40 hover:bg-br-smoke/50 transition"
                >
                  <td className="py-3">{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.service}</td>
                  <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a
                      href={`/admin/es/quotes/${q.id}`}
                      className="text-br-red-main hover:text-br-red-light underline"
                    >
                      {t("admin.quotes.table.view")}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
