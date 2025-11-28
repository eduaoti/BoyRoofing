"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import useTranslation from "@/hooks/useTranslation";

export default function Navbar() {
  const { t, lang } = useTranslation();
  const pathname = usePathname();

  const base = lang === "es" ? "/es" : "/en";

  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full border-b border-br-smoke bg-br-carbon/95 backdrop-blur-md shadow-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* LOGO + TEXTO */}
        <Link href={base} className="flex items-center gap-2 group">
          <Image
            src="/gallery/LOGO.png"
            alt="Boys Roofing Logo"
            width={42}
            height={42}
            className="object-contain drop-shadow-lg transition-transform group-hover:scale-105"
          />

          {/* 🔴 TEXTO NO SE REEMPLAZA */}
          <span className="text-xl font-bold text-br-red-main tracking-wide group-hover:text-br-red-light transition-colors">
            Boys Roofing
          </span>
        </Link>

        {/* LINKS */}
        <div className="hidden gap-8 text-sm md:flex">

          <Link
            href={base}
            className={`nav-link hover:text-br-red-light ${
              isActive(base) ? "nav-link-active text-br-red-light" : ""
            }`}
          >
            {t("navbar.home")}
          </Link>

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
            href={lang === "en" ? "/en/quote" : "/es/cotizacion"}
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
