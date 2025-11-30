import HomePage from "@/components/HomePage";
import ReviewsCarousel from "@/components/ReviewsCarousel";

export default function PageEN() {
  return (
    <main className="bg-[#0F0F0F] text-white">
      {/* Contenido del Home */}
      <HomePage />

      {/* Reseñas al final */}
      <section className="pt-10 pb-20">
        <ReviewsCarousel lang="en" />
      </section>
    </main>
  );
}
