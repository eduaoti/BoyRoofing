"use client";

import en from "@/locales/en.json";
import es from "@/locales/es.json";
import { usePathname } from "next/navigation";

export default function useTranslation() {
  const pathname = usePathname();

  // Detecta idioma por la ruta
  const lang = pathname.startsWith("/es") ? "es" : "en";

  // Traducciones disponibles
  const translations = lang === "es" ? es : en;

  // Función t()
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (!value) return key; // fallback si no existe
    }

    return value;
  };

  return { t, lang };
}
