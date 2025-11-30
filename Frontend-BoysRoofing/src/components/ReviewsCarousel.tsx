"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { apiFetch } from "@/lib/api";
import useTranslation from "@/hooks/useTranslation";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

interface ReviewsCarouselProps {
  reviews?: Review[];
  lang?: "es" | "en";
  canReview?: boolean;
  onOpenReviewModal?: () => void;
}

export default function ReviewsCarousel({
  reviews = [],
  lang,
  canReview = false,
  onOpenReviewModal,
}: ReviewsCarouselProps) {
  const { lang: ctxLang } = useTranslation();
  const activeLang: "es" | "en" =
    lang ?? (ctxLang === "en" ? "en" : "es");

  // Mock ES
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

  // Mock EN
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
        if (reviews.length > 0) {
          setData(reviews);
          return;
        }

        const res = await apiFetch("/reviews");

        if (!res.ok) {
          console.error("Error loading reviews:", await res.text());
          setData(activeLang === "en" ? defaultReviewsEN : defaultReviewsES);
          return;
        }

        const json = await res.json();

        const mapped: Review[] = Array.isArray(json)
          ? json.map((r: any) => ({
              id: r.id,
              name: r.name,
              rating: r.rating,
              comment: r.message,
            }))
          : [];

        if (mapped.length === 0) {
          setData(activeLang === "en" ? defaultReviewsEN : defaultReviewsES);
        } else {
          setData(mapped);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setData(activeLang === "en" ? defaultReviewsEN : defaultReviewsES);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [reviews, activeLang]);

  const texts = {
    es: {
      title: "Reseñas de Nuestros Clientes",
      button: "Deja tu reseña",
      onlyIf: "Solo puedes dejar una reseña si has solicitado una cotización.",
      loading: "Cargando reseñas...",
      empty: "Aún no hay reseñas. ¡Sé el primero en opinar!",
    },
    en: {
      title: "Our Clients' Reviews",
      button: "Leave your review",
      onlyIf: "You can only leave a review if you have requested a quote.",
      loading: "Loading reviews...",
      empty: "There are no reviews yet. Be the first to leave one!",
    },
  };

  const t = texts[activeLang];

  if (loading) {
    return (
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-br-white">
          {t.title}
        </h2>
        <p className="text-center text-br-stone">{t.loading}</p>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-br-white">
          {t.title}
        </h2>
        <p className="text-center text-br-stone">{t.empty}</p>
      </section>
    );
  }

  const onlyOne = data.length === 1;
  const canLoop = data.length >= 3; // loop solo si hay 3+ reseñas

  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-6 text-br-white">
        {t.title}
      </h2>

      {/* Botón reseña */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
            canReview
              ? "bg-br-red-main text-white hover:bg-br-red-light shadow-md"
              : "bg-gray-700/60 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!canReview}
          onClick={() => {
            if (canReview && onOpenReviewModal) {
              onOpenReviewModal();
            }
          }}
        >
          {t.button}
        </button>
      </div>
      {!canReview && (
        <p className="text-center text-xs text-br-stone mb-6">
          {t.onlyIf}
        </p>
      )}

      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={data.length > 1 ? { clickable: true } : false}
        autoplay={
          data.length > 1
            ? {
                delay: 4000,
                disableOnInteraction: false,
              }
            : false
        }
        loop={canLoop}
        slidesPerView={1}
        className="!pb-10"
      >
        {data.map((review) => (
          <SwiperSlide key={review.id} className="!flex !justify-center">
            <article className="bg-[#111315] border border-[#2a2a2a] rounded-2xl px-8 py-6 shadow-xl max-w-xl w-full mx-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
              {/* Rating */}
              <div className="flex justify-center mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < review.rating ? "text-yellow-400" : "text-gray-600"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-br-stone italic mb-4 text-center">
                “{review.comment}”
              </p>

              {/* Name */}
              <p className="text-sm font-semibold text-br-white text-center">
                — {review.name}
              </p>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
