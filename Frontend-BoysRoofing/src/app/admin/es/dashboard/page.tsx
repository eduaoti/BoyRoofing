"use client";

import { useEffect, useState } from "react";
import useTranslation from "@/hooks/useTranslation";

export default function DashboardES() {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      const token = localStorage.getItem("br_admin_token");

      const res = await fetch("http://localhost:3200/quotes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setQuotes(data);
      setLoading(false);
    }

    loadQuotes();
  }, []);

  if (loading) return <p className="text-br-white/70">Cargando...</p>;

  const total = quotes.length;
  const pending = quotes.filter((q) => q.status === "PENDING").length;
  const recent = quotes.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-br-red-main mb-6">
        {t("admin.dashboard.title")}
      </h1>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-xl bg-br-smoke/30 border border-br-smoke-light shadow-lg">
          <h2 className="text-lg text-br-pearl">{t("admin.dashboard.totalQuotes")}</h2>
          <p className="text-4xl font-bold text-br-red-main">{total}</p>
        </div>

        <div className="p-6 rounded-xl bg-br-smoke/30 border border-br-smoke-light shadow-lg">
          <h2 className="text-lg text-br-pearl">{t("admin.dashboard.pendingQuotes")}</h2>
          <p className="text-4xl font-bold text-br-red-light">{pending}</p>
        </div>
      </div>

      {/* RECENT QUOTES */}
      <div className="rounded-xl bg-br-smoke/20 border border-br-smoke-light shadow-lg p-6">
        <h2 className="text-xl font-semibold text-br-red-main mb-4">
          {t("admin.dashboard.recentQuotes")}
        </h2>

        {recent.length === 0 && (
          <p className="text-br-white/70">{t("admin.dashboard.noQuotes")}</p>
        )}

        <ul className="space-y-3">
          {recent.map((q) => (
            <li
              key={q.id}
              className="flex justify-between bg-br-smoke/30 px-4 py-3 rounded-lg border border-br-smoke-light hover:bg-br-smoke/50 transition"
            >
              <span>{q.name}</span>
              <a
                href={`/admin/es/quotes/${q.id}`}
                className="text-br-red-main hover:text-br-red-light underline"
              >
                Ver
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
