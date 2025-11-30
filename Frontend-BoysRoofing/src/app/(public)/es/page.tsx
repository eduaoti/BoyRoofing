import HomePage from "@/components/HomePage";
import ReviewsCarousel from "@/components/ReviewsCarousel";

export default function PageES() {
  return (
    <main className="bg-[#0F0F0F] text-white">
      {/* Contenido completo del Home */}
      <HomePage />

      {/* Reseñas al final de la página */}
      <section className="pt-10 pb-20">
        <ReviewsCarousel lang="es" />
      </section>
    </main>
  );
}
