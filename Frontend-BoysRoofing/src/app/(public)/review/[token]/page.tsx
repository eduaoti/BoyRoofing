"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getProjectByToken,
  uploadReviewPhoto,
  submitProjectReview,
} from "@/lib/projects";
import Image from "next/image";
import Link from "next/link";

const TEXTS = {
  es: {
    loading: "Cargando...",
    invalidLink: "Link inválido",
    invalidOrExpired: "Link inválido o expirado",
    backHome: "Volver al inicio",
    title: "Deja tu reseña",
    projectLabel: "Proyecto:",
    orDefault: "Cuéntanos tu experiencia con Boys Roofing",
    nameLabel: "Tu nombre (opcional)",
    namePlaceholder: "Ej. Juan Pérez",
    ratingLabel: "Valoración (1-5 estrellas)",
    reviewLabel: "Tu reseña *",
    reviewPlaceholder: "Cuéntanos cómo fue el servicio...",
    photoLabel: "Foto (opcional)",
    photoPreview: "Vista previa",
    submit: "Enviar reseña",
    submitting: "Enviando...",
    successTitle: "¡Gracias por tu reseña!",
    successMessage:
      "Tu opinión ha sido enviada. Aparecerá en nuestra web una vez la revisemos.",
    successBack: "Volver al inicio",
  },
  en: {
    loading: "Loading...",
    invalidLink: "Invalid link",
    invalidOrExpired: "Invalid or expired link",
    backHome: "Back to home",
    title: "Leave your review",
    projectLabel: "Project:",
    orDefault: "Tell us about your experience with Boys Roofing",
    nameLabel: "Your name (optional)",
    namePlaceholder: "E.g. John Smith",
    ratingLabel: "Rating (1-5 stars)",
    reviewLabel: "Your review *",
    reviewPlaceholder: "Tell us how the service was...",
    photoLabel: "Photo (optional)",
    photoPreview: "Preview",
    submit: "Submit review",
    submitting: "Sending...",
    successTitle: "Thank you for your review!",
    successMessage:
      "Your feedback has been submitted. It will appear on our website once we review it.",
    successBack: "Back to home",
  },
};

export default function ReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") === "en" ? "en" : "es") as "es" | "en";
  const t = TEXTS[lang];
  const token = String(params?.token || "");
  const [project, setProject] = useState<{
    id: number;
    name: string | null;
    logoUrl: string;
    token: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError(TEXTS[lang].invalidLink);
      return;
    }
    getProjectByToken(token)
      .then(setProject)
      .catch((e) => setError(e.message || TEXTS[lang].invalidOrExpired))
      .finally(() => setLoading(false));
  }, [token, lang]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !message.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        const up = await uploadReviewPhoto(token, photoFile);
        photoUrl = up.url;
      }
      await submitProjectReview(token, {
        clientName: clientName.trim() || undefined,
        message: message.trim(),
        rating,
        photoUrl,
      });
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center text-white">
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!project && error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center text-white px-6">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href={lang === "en" ? "/en" : "/es"} className="text-br-red-light hover:underline">
          {t.backHome}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center text-white px-6 text-center">
        <h1 className="page-h2 text-br-red-light mb-4">
          {t.successTitle}
        </h1>
        <p className="text-br-pearl mb-6">
          {t.successMessage}
        </p>
        <Link
          href={lang === "en" ? "/en" : "/es"}
          className="px-6 py-3 rounded-xl bg-br-red-main text-white font-semibold hover:bg-br-red-light transition"
        >
          {t.successBack}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center mb-6">
          {project?.logoUrl && (
            <Image
              src={project.logoUrl}
              alt="Boys Roofing"
              width={120}
              height={120}
              className="object-contain"
            />
          )}
        </div>
        <h1 className="page-h2 text-center text-br-red-light mb-2">
          {t.title}
        </h1>
        <p className="text-center text-br-pearl text-sm mb-8">
          {project?.name
            ? `${t.projectLabel} ${project.name}`
            : t.orDefault}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-br-pearl mb-1">
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500"
              placeholder={t.namePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm text-br-pearl mb-1">
              {t.ratingLabel}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl ${
                    n <= rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-br-pearl mb-1">
              {t.reviewLabel}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 resize-none"
              placeholder={t.reviewPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm text-br-pearl mb-1">
              {t.photoLabel}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-br-pearl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-br-red-main file:text-white"
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt={t.photoPreview}
                className="mt-2 rounded-xl max-h-40 object-cover"
              />
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="w-full rounded-xl bg-br-red-main py-3 font-semibold text-white hover:bg-br-red-light disabled:opacity-50 transition"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </form>

        <p className="text-center text-br-pearl text-xs mt-6">
          <Link href={lang === "en" ? "/en" : "/es"} className="hover:text-br-red-light">
            ← {t.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
