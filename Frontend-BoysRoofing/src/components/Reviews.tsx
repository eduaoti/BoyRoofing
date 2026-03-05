// src/components/Reviews.tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Review {
  id: number;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await apiFetch("/reviews");

        if (!res.ok) {
          console.error("Error loading reviews:", await res.text());
          setReviews([]);
          return;
        }

        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-10 px-6 bg-gray-100">
        <p className="text-center text-gray-600">Cargando reseñas...</p>
      </section>
    );
  }

  return (
    <section className="w-full py-10 px-6 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-6">
        Reseñas de Nuestros Clientes
      </h2>

      {reviews.length === 0 && (
        <p className="text-center text-gray-600">
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-[#f5f5f5] border border-[#e0e0e0] p-5 rounded-xl shadow-md"
          >
            <h4 className="font-semibold text-lg">{review.name}</h4>

            <div className="text-yellow-500 mb-2">
              {"⭐".repeat(review.rating)}
            </div>

            <p className="text-gray-700">{review.message}</p>

            <p className="mt-3 text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
