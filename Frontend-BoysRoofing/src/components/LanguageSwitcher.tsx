"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // 👇 Le damos tipo explícito con índice string
  const routeMap: Record<string, string> = {
    servicios: "services",
    services: "servicios",

    galeria: "gallery",
    gallery: "galeria",

    nosotros: "about",
    about: "nosotros",

    contacto: "contact",
    contact: "contacto",

    cotizacion: "quote",
    quote: "cotizacion",

    "": "",
  };

  const segments = pathname.split("/").filter(Boolean);
  const currentLang = segments[0] === "es" ? "es" : "en";
  const newLang = currentLang === "es" ? "en" : "es"; // (no lo usas, pero no estorba)

  const currentRoute = segments[1] || "";
  const translatedRoute = routeMap[currentRoute] ?? "";

  const buildPath = (lang: "es" | "en") => {
    if (translatedRoute === "") return `/${lang}`;

    // Si cambio de idioma, uso la ruta traducida
    const route = lang === currentLang ? currentRoute : translatedRoute;

    return `/${lang}/${route}`;
  };

  const goTo = (lang: "es" | "en") => {
    router.push(buildPath(lang));
  };

  return (
    <div className="flex items-center gap-2 text-xs font-semibold">
      {/* ES */}
      <button
        onClick={() => goTo("es")}
        className={
          currentLang === "es"
            ? "text-br-red-light"
            : "hover:text-br-red-light"
        }
      >
        ES
      </button>

      <span className="text-br-stone">/</span>

      {/* EN */}
      <button
        onClick={() => goTo("en")}
        className={
          currentLang === "en"
            ? "text-br-red-light"
            : "hover:text-br-red-light"
        }
      >
        EN
      </button>
    </div>
  );
}
