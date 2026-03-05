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
}

export default function ReviewsCarousel({
  reviews = [],
  lang,
}: ReviewsCarouselProps) {
  const { lang: ctxLang } = useTranslation();
  const activeLang: "es" | "en" =
    lang ?? (ctxLang === "en" ? "en" : "es");

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<"email" | "form">("email");
  const [email, setEmail] = useState("");
  const [canReviewData, setCanReviewData] = useState<{ quoteId: number; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  async function loadReviews() {
    try {
      if (reviews.length > 0) {
        setData(reviews);
        return;
      }
      const res = await apiFetch("/reviews");
      if (!res.ok) {
        setData(activeLang === "en" ? defaultReviewsEN : defaultReviewsES);
        return;
      }
      const json = await res.json();
      const mapped: Review[] = Array.isArray(json)
        ? json.map((r: { id: number; name: string; rating: number; message: string }) => ({
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
    } catch {
      setData(activeLang === "en" ? defaultReviewsEN : defaultReviewsES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [reviews, activeLang]);

  function openModal() {
    setModalOpen(true);
    setStep("email");
    setEmail("");
    setCanReviewData(null);
    setRating(5);
    setMessage("");
    setModalError("");
    setSubmitSuccess(false);
  }

  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setModalLoading(true);
    setModalError("");
    try {
      const res = await apiFetch(`/reviews/can-review?email=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.canReview && json.quoteId && json.name) {
        setCanReviewData({ quoteId: json.quoteId, name: json.name });
        setStep("form");
      } else {
        setModalError(t.modalErrorNoEligible);
      }
    } catch {
      setModalError(t.modalErrorGeneric);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!canReviewData || !message.trim()) return;
    setModalLoading(true);
    setModalError("");
    try {
      const res = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          quoteId: canReviewData.quoteId,
          name: canReviewData.name,
          email: email.trim(),
          rating,
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setModalError(err.message || t.modalErrorGeneric);
        return;
      }
      setSubmitSuccess(true);
      await loadReviews();
      setTimeout(() => {
        setModalOpen(false);
      }, 1500);
    } catch {
      setModalError(t.modalErrorGeneric);
    } finally {
      setModalLoading(false);
    }
  }

  const texts = {
    es: {
      title: "Reseñas de Nuestros Clientes",
      button: "Deja tu reseña",
      onlyIf: "Solo puedes dejar una reseña si recibiste una factura por correo (tras solicitar una cotización).",
      loading: "Cargando reseñas...",
      empty: "Aún no hay reseñas. ¡Sé el primero en opinar!",
      modalTitle: "Dejar reseña",
      modalEmailLabel: "Correo con el que recibiste la factura",
      modalEmailPlaceholder: "tu@correo.com",
      modalContinue: "Continuar",
      modalBack: "Volver",
      modalNameLabel: "Nombre",
      modalRatingLabel: "Valoración",
      modalMessageLabel: "Tu reseña",
      modalMessagePlaceholder: "Cuéntanos tu experiencia...",
      modalSubmit: "Enviar reseña",
      modalSuccess: "¡Gracias! Tu reseña se ha publicado.",
      modalErrorNoEligible: "No hay ninguna factura enviada a este correo, o ya dejaste una reseña.",
      modalErrorGeneric: "No se pudo enviar. Intenta de nuevo.",
    },
    en: {
      title: "Our Clients' Reviews",
      button: "Leave your review",
      onlyIf: "You can only leave a review if you received an invoice by email (after requesting a quote).",
      loading: "Loading reviews...",
      empty: "There are no reviews yet. Be the first to leave one!",
      modalTitle: "Leave a review",
      modalEmailLabel: "Email where you received the invoice",
      modalEmailPlaceholder: "you@email.com",
      modalContinue: "Continue",
      modalBack: "Back",
      modalNameLabel: "Name",
      modalRatingLabel: "Rating",
      modalMessageLabel: "Your review",
      modalMessagePlaceholder: "Tell us about your experience...",
      modalSubmit: "Submit review",
      modalSuccess: "Thank you! Your review has been published.",
      modalErrorNoEligible: "No invoice was sent to this email, or you already left a review.",
      modalErrorGeneric: "Could not submit. Please try again.",
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
          type="button"
          className="px-6 py-2 rounded-lg font-semibold text-sm transition bg-br-red-main text-white hover:bg-br-red-light shadow-md"
          onClick={openModal}
        >
          {t.button}
        </button>
      </div>
      <p className="text-center text-xs text-br-stone mb-6">
        {t.onlyIf}
      </p>

      {/* Modal dejar reseña */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => !modalLoading && setModalOpen(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-br-white mb-4">{t.modalTitle}</h3>
            {submitSuccess ? (
              <p className="text-br-stone">{t.modalSuccess}</p>
            ) : step === "email" ? (
              <form onSubmit={handleCheckEmail}>
                <label className="block text-sm text-br-stone mb-2">{t.modalEmailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.modalEmailPlaceholder}
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0F0F0F] px-4 py-2 text-white placeholder:text-gray-500 mb-4"
                  required
                />
                {modalError && <p className="text-red-400 text-sm mb-3">{modalError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={modalLoading} className="flex-1 rounded-lg bg-br-red-main text-white py-2 font-medium disabled:opacity-60">
                    {modalLoading ? "..." : t.modalContinue}
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-br-stone">
                    {t.modalBack}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm text-br-stone mb-1">{t.modalNameLabel}</label>
                  <p className="text-br-white font-medium">{canReviewData?.name}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-br-stone mb-1">{t.modalEmailLabel}</label>
                  <p className="text-br-white text-sm">{email}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-br-stone mb-2">{t.modalRatingLabel}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-br-stone mb-2">{t.modalMessageLabel}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.modalMessagePlaceholder}
                    rows={4}
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0F0F0F] px-4 py-2 text-white placeholder:text-gray-500 resize-none"
                    required
                  />
                </div>
                {modalError && <p className="text-red-400 text-sm mb-3">{modalError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setStep("email"); setModalError(""); }} className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-br-stone">
                    {t.modalBack}
                  </button>
                  <button type="submit" disabled={modalLoading || !message.trim()} className="flex-1 rounded-lg bg-br-red-main text-white py-2 font-medium disabled:opacity-60">
                    {modalLoading ? "..." : t.modalSubmit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
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
