"use client";

import { useEffect, useState } from "react";

export default function QuotesEN() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const token = localStorage.getItem("br_admin_token") ?? "";

        const res = await fetch("http://localhost:3200/quotes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setQuotes(data);
      } catch (err) {
        console.error("Error loading quotes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, []);

  if (loading) return <p className="text-white p-4">Cargando...</p>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Quotes</h1>

      <div className="space-y-4">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="bg-br-smoke p-4 rounded-lg shadow border border-br-red-main"
          >
            <p><strong>Nombre:</strong> {q.name}</p>
            <p><strong>Teléfono:</strong> {q.phone}</p>
            <p><strong>Email:</strong> {q.email}</p>
            <p><strong>Servicio:</strong> {q.service}</p>
            <p><strong>Mensaje:</strong> {q.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
