"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import useTranslation from "@/hooks/useTranslation";
import { useSiteImages } from "@/contexts/SiteImagesContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CAROUSEL_KEYS = ["carousel_1", "carousel_2", "carousel_3", "carousel_4", "carousel_5"] as const;

export default function WorkCarousel() {
  const { t } = useTranslation();
  const { getImage } = useSiteImages();
  const images = CAROUSEL_KEYS.map((key) => getImage(key, "")).filter(Boolean);

  if (images.length === 0) return null;

  return (
    <div className="mt-28 px-4">
      <h2 className="page-h2 text-center text-white mb-10">
        {t("services.ourWork")}
      </h2>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={25}
        slidesPerView={1.1}
        centeredSlides
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500 }}
        loop
        className="max-w-5xl mx-auto"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.45)] border border-white/10 backdrop-blur-sm bg-white/5 transition-transform hover:scale-[1.02] mx-auto w-[300px] md:w-[350px] lg:w-[380px]">
              <img
                src={src}
                alt={`work-${i}`}
                className="object-cover w-full h-[65vh] md:h-[70vh] max-h-[800px]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
