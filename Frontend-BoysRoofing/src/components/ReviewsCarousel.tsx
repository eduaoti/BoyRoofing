// src/components/ReviewsCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { apiFetch } from "@/lib/api";

// Define el tipo de review
interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

interface ReviewsCarouselProps {
  reviews?: Review[];
  lang?: "es" | "en";
}

export default function ReviewsCarousel({
  reviews = [],
  lang = "es",
}: ReviewsCarouselProps) {
  // Reseñas de ejemplo en español
  const defaultReviewsES: Review[] = [
    {
      id: 1,
      name: "Carlos Martínez",
      rating: 5,
      comment:
        "Excelente servicio, llegaron rápido y repararon mi techo en el mismo día. 100% recomendados.",
    },
    {
      id: 2,
      name: "María López",
      rating: 5,
      comment:
        "Muy profesionales y con buena atención. Me explicaron todo el proceso. Gran trabajo.",
    },
    {
      id: 3,
      name: "Luis Hernández",
      rating: 4,
      comment: "Buen servicio y precio justo. Mi techo quedó como nuevo.",
    },
  ];

  // Reseñas de ejemplo en inglés
  const defaultReviewsEN: Review[] = [
    {
      id: 1,
      name: "Carlos Martinez",
      rating: 5,
      comment:
        "Excellent service, they arrived quickly and repaired my roof the same day. 100% recommended.",
    },
    {
      id: 2,
      name: "Maria Lopez",
      rating: 5,
      comment:
        "Very professional and great attention. They explained the whole process. Great job.",
    },
    {
      id: 3,
      name: "Luis Hernandez",
      rating: 4,
      comment: "Good service and fair price. My roof looks like new.",
    },
  ];

  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        // Si ya vienen reviews por props, usamos esas y no llamamos al backend
        if (reviews.length > 0) {
          setData(reviews);
          return;
        }

        const res = await apiFetch("/reviews");

        if (!res.ok) {
          console.error("Error loading reviews:", await res.text());
          // fallback a mock por idioma
          setData(lang === "en" ? defaultReviewsEN : defaultReviewsES);
          return;
        }

        const json = await res.json();

        // El backend devuelve algo como:
        // { id, name, message, rating, createdAt }
        const mapped: Review[] = Array.isArray(json)
          ? json.map((r: any) => ({
              id: r.id,
              name: r.name,
              rating: r.rating,
              comment: r.message,
            }))
          : [];

        if (mapped.length === 0) {
          setData(lang === "en" ? defaultReviewsEN : defaultReviewsES);
        } else {
          setData(mapped);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setData(lang === "en" ? defaultReviewsEN : defaultReviewsES);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [reviews, lang]);

  // Simulación: función para verificar si el usuario puede dejar reseña
  // En producción, deberías obtener este dato del backend según el usuario autenticado
  const userCanReview = false; // Cambia esto según la lógica real

  const texts = {
    es: {
      title: "Reseñas de Nuestros Clientes",
      button: "Deja tu reseña",
      onlyIf:
        "Solo puedes dejar una reseña si has solicitado una cotización.",
    },
    en: {
      title: "Our Clients' Reviews",
      button: "Leave your review",
      onlyIf: "You can only leave a review if you have requested a quote.",
    },
  };

  if (loading) {
    return (
      <section className="w-full max-w-4xl mx-auto py-10">
        <p className="text-center text-gray-500">
          {lang === "en" ? "Loading reviews..." : "Cargando reseñas..."}
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto py-10">
      <h2 className="text-3xl font-bold text-center mb-6">
        {texts[lang].title}
      </h2>

      {/* Botón para dejar reseña */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            userCanReview
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!userCanReview}
          onClick={() => {
            if (userCanReview) {
              // Aquí abre el modal/formulario para dejar reseña
              alert("Abrir formulario de reseña");
            }
          }}
        >
          {texts[lang].button}
        </button>
      </div>
      {!userCanReview && (
        <p className="text-center text-sm text-gray-500 mb-4">
          {texts[lang].onlyIf}
        </p>
      )}

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500 }}
        spaceBetween={20}
        slidesPerView={1}
      >
        {data.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="bg-white shadow-lg rounded-xl p-6 text-center">
              {/* Rating */}
              <div className="flex justify-center mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 italic mb-4">
                "{review.comment}"
              </p>

              {/* Name */}
              <p className="font-semibold text-gray-900">- {review.name}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
