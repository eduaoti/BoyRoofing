import HomePage from "@/components/HomePage";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import GoldenTriangleMap from "@/components/GoldenTriangleMap";

export default function PageEN() {
  return (
    <main className="bg-[#0F0F0F] text-white min-w-0 overflow-x-hidden">
      <HomePage />

      <GoldenTriangleMap lang="en" />

      {/* Reviews */}
      <section id="reviews" className="border-t border-white/5 bg-[#0c0c0d] py-10 sm:py-16 md:py-20 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full min-w-0">
          <ReviewsCarousel lang="en" />
        </div>
      </section>
    </main>
  );
}
