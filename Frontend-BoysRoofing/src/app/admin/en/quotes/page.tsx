// src/app/admin/en/quotes/page.tsx
"use client";

import { useEffect, useState } from "react";
import useTranslation from "@/hooks/useTranslation";

export default function QuotesEN() {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const token =
          localStorage.getItem("br_admin_token") ?? ""; // mismo nombre

        const res = await fetch("http://localhost:3200/quotes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Error loading quotes:", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setQuotes(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading quotes:", err);
        setLoading(false);
      }
    }

    loadQuotes();
  }, []);

  if (loading) return <p>Cargando quotes...</p>;

  return (
    <main className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">{t("admin_quotes_title")}</h1>
      <ul className="space-y-2">
        {quotes.map((q) => (
          <li key={q.id} className="bg-br-smoke p-3 rounded">
            {q.text}
          </li>
        ))}
      </ul>
    </main>
  );
}
