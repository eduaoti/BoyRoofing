"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import useTranslation from "@/hooks/useTranslation";

export default function Navbar() {
  const { t, lang } = useTranslation();
  const pathname = usePathname();

  const base = lang === "es" ? "/es" : "/en";

  // Función: link activo
  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full border-b border-br-smoke bg-br-carbon/95 backdrop-blur-md shadow-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

        {/* LOGO */}
        <Link
          href={base}
          className="text-xl font-bold text-br-red-main tracking-wide hover:text-br-red-light transition-colors"
        >
          Boys Roofing
        </Link>

        {/* LINKS */}
        <div className="hidden gap-8 text-sm md:flex">

          {/* Inicio */}
          <Link
            href={base}
            className={`nav-link hover:text-br-red-light ${
              isActive(base) ? "nav-link-active text-br-red-light" : ""
            }`}
          >
            {t("navbar.home")}
          </Link>

          {/* Servicios */}
          <Link
            href={`${base}${lang === "es" ? "/servicios" : "/services"}`}
            className={`nav-link hover:text-br-red-light ${
              isActive(`${base}${lang === "es" ? "/servicios" : "/services"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {t("navbar.services")}
          </Link>

          {/* ⭐ NUEVO → Galería */}
          <Link
            href={`${base}${lang === "es" ? "/galeria" : "/gallery"}`}
            className={`nav-link hover:text-br-red-light ${
              isActive(`${base}${lang === "es" ? "/galeria" : "/gallery"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {lang === "es" ? "Galería" : "Gallery"}
          </Link>

          {/* Nosotros */}
          <Link
            href={`${base}${lang === "es" ? "/nosotros" : "/about"}`}
            className={`nav-link hover:text-br-red-light ${
              isActive(`${base}${lang === "es" ? "/nosotros" : "/about"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {t("navbar.about")}
          </Link>

          {/* Contacto */}
          <Link
            href={`${base}${lang === "es" ? "/contacto" : "/contact"}`}
            className={`nav-link hover:text-br-red-light ${
              isActive(`${base}${lang === "es" ? "/contacto" : "/contact"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {t("navbar.contact")}
          </Link>
        </div>

        {/* BOTÓN + IDIOMA */}
        <div className="flex items-center gap-4">
          <Link
            href={`${base}${lang === "es" ? "/contacto" : "/contact"}`}
            className="btn-pulse rounded bg-br-red-main px-4 py-2 text-sm font-semibold hover:bg-br-red-light transition-all shadow-md"
          >
            {t("navbar.quote")}
          </Link>

          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
