"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import useTranslation from "@/hooks/useTranslation";

export default function Navbar() {
  const { t, lang } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const base = lang === "es" ? "/es" : "/en";

  const isActive = (href: string) => pathname === href;

  // 🔒 Cerrar el menú cuando cambie la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="w-full border-b border-br-smoke bg-br-carbon/95 backdrop-blur-md shadow-md sticky top-0 z-40">
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

        {/* LINKS — DESKTOP */}
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

        {/* BOTÓN + IDIOMA — DESKTOP */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={lang === "en" ? "/en/quote" : "/es/cotizacion"}
            className="btn-pulse rounded bg-br-red-main px-4 py-2 text-sm font-semibold hover:bg-br-red-light transition-all shadow-md"
          >
            {t("navbar.quote")}
          </Link>

          <LanguageSwitcher />
        </div>

        {/* HAMBURGUESA — MOBILE */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-br-smoke/20 focus:outline-none focus:ring-2 focus:ring-br-red-main"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Open main menu</span>
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 bg-white transition-transform ${
                isOpen ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-opacity ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-transform ${
                isOpen ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* MENÚ MOBILE */}
      <div
        className={`md:hidden overflow-hidden border-t border-br-smoke bg-br-carbon/98 backdrop-blur-md transition-all duration-200 ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3 text-sm">
          <Link
            href={base}
            className={`nav-link block py-1 ${
              isActive(base) ? "nav-link-active text-br-red-light" : ""
            }`}
          >
            {t("navbar.home")}
          </Link>

          <Link
            href={`${base}${lang === "es" ? "/servicios" : "/services"}`}
            className={`nav-link block py-1 ${
              isActive(`${base}${lang === "es" ? "/servicios" : "/services"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {t("navbar.services")}
          </Link>

          <Link
            href={`${base}${lang === "es" ? "/nosotros" : "/about"}`}
            className={`nav-link block py-1 ${
              isActive(`${base}${lang === "es" ? "/nosotros" : "/about"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {t("navbar.about")}
          </Link>

          <Link
            href={`${base}${lang === "es" ? "/contacto" : "/contact"}`}
            className={`nav-link block py-1 ${
              isActive(`${base}${lang === "es" ? "/contacto" : "/contact"}`)
                ? "nav-link-active text-br-red-light"
                : ""
            }`}
          >
            {t("navbar.contact")}
          </Link>

          <div className="mt-2 flex items-center justify-between gap-3">
            <Link
              href={lang === "en" ? "/en/quote" : "/es/cotizacion"}
              className="flex-1 text-center rounded bg-br-red-main px-4 py-2 text-sm font-semibold hover:bg-br-red-light transition-all shadow-md"
            >
              {t("navbar.quote")}
            </Link>

            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
