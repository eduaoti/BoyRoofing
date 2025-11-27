"use client";

import { useEffect, useState } from "react";

type ImageItem = {
  src: string;
  alt: string;
};

const images: ImageItem[] = Array.from({ length: 36 }).map((_, i) => {
  const index = i + 1;
  return {
    src: `/gallery/imagen${index}.jpg`,
    alt: `Proyecto Boys Roofing imagen ${index}`,
  };
});

export default function GalleryPageEs() {
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsBottom(
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 50
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToggle = () => {
    if (isBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="min-h-screen bg-br-carbon px-6 py-16 md:px-20">
      <div className="mx-auto max-w-4xl text-center mb-16 animate-fade-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-br-red-main drop-shadow-lg tracking-wide">
          Galería de Proyectos
        </h1>

        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-br-red-main" />

        <p className="mt-6 text-base md:text-lg text-br-pearl/90 leading-relaxed">
          Una selección de trabajos recientes realizados por Boys Roofing. <br />
          Reparaciones, renovaciones, antes y después, y proyectos completos de techado.
        </p>
      </div>

      <div className="masonry mx-auto max-w-6xl columns-1 gap-6 sm:columns-2 md:columns-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="mb-6 break-inside-avoid opacity-0 animate-stagger"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <button
              type="button"
              onClick={() => setSelected(img)}
              className="gallery-card group w-full"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="gallery-img"
              />
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-modal-fade"
          onClick={() => setSelected(null)}
        >
          <div
            className="
              relative max-h-[90vh] max-w-5xl overflow-hidden 
              rounded-3xl bg-br-smoke/90 backdrop-blur-xl 
              shadow-2xl border border-br-smoke-light/20
              animate-modal-zoom
            "
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.src}
              alt={selected.alt}
              className="max-h-[80vh] w-full object-contain"
            />

            <div className="flex items-center justify-end gap-4 border-t border-br-smoke-light/20 bg-black/60 px-4 py-3">
              <button
                className="
                  rounded-full border border-br-smoke-light/40 px-3 py-1 
                  text-xs font-semibold text-br-pearl 
                  hover:border-br-red-main hover:text-br-red-main transition
                "
                onClick={() => setSelected(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={scrollToggle}
        className="
          fixed bottom-6 right-6 z-50 
          h-12 w-12 rounded-full bg-br-red-main 
          flex items-center justify-center text-xl font-bold 
          shadow-xl hover:bg-br-red-light transition
          btn-pulse
        "
      >
        {isBottom ? "⬆" : "⬇"}
      </button>
    </section>
  );
}
