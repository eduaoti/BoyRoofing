import HomePage from "@/components/HomePage";
import ReviewsCarousel from "@/components/ReviewsCarousel";

export default function PageEN() {
  return (
    <main className="bg-[#0F0F0F] text-white">
      <HomePage />

      {/* Reseñas: sección única al cierre del home */}
      <section id="reviews" className="border-t border-white/5 bg-[#0c0c0d] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <ReviewsCarousel lang="en" />
        </div>
      </section>
    </main>
  );
}
