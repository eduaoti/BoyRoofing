// app/admin/es/(panel)/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPinIcon, HomeIcon, DocumentTextIcon, DocumentPlusIcon, ArrowRightOnRectangleIcon, UserGroupIcon, BanknotesIcon, Bars3Icon, XMarkIcon, CurrencyDollarIcon, DocumentCheckIcon, PhotoIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function AdminESPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("br_admin_token");
    document.cookie = "br_admin_token=; Max-Age=0; path=/; SameSite=Lax";
    setMobileMenuOpen(false);
    router.push("/admin/es/login");
  }

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  const pathname = usePathname();
  const navLink = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>, exact?: boolean) => {
    const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
          isActive ? "admin-nav-active pl-4" : "hover:bg-br-carbon/60 hover:text-br-red-main"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {label}
      </Link>
    );
  };

  const mobileNavLink = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>, exact?: boolean) => {
    const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={closeMenu}
        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
          isActive ? "admin-nav-active pl-4" : "hover:bg-br-carbon/60 hover:text-br-red-main text-br-pearl"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-br-carbon text-white no-print">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-br-smoke/95 border-r border-white/5 px-6 py-6 shadow-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-br-red-main mb-1">
            Boy&apos;s Roofing
          </h2>
          <p className="text-xs text-br-pearl/80 mb-8">
            Panel de administración · ES
          </p>

          <nav className="space-y-0.5 text-sm">
            {navLink("/admin/es/dashboard", "Dashboard", HomeIcon)}
            {navLink("/admin/es/quotes", "Cotizaciones", DocumentTextIcon)}
            {navLink("/admin/es/crear-factura", "Crear factura", DocumentPlusIcon)}
            {navLink("/admin/es/medir", "Medir", MapPinIcon)}
            {navLink("/admin/es/nomina/trabajadores", "Trabajadores", UserGroupIcon)}
            {navLink("/admin/es/nomina", "Nómina", BanknotesIcon, true)}
            {navLink("/admin/es/nomina/balances", "Balances / Deudas", CurrencyDollarIcon)}
            {navLink("/admin/es/recibos", "Recibos de pago", DocumentCheckIcon)}
            {navLink("/admin/es/imagenes-sitio", "Imágenes del sitio", PhotoIcon)}
            {navLink("/admin/es/proyectos", "Proyectos / Mapa", BuildingOffice2Icon)}
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 admin-btn-primary text-white py-2.5 px-4 rounded-xl text-sm font-semibold"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </button>
      </aside>

      {/* MOBILE: navbar + menú desplegable */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-br-smoke-light bg-br-smoke/95 backdrop-blur">
          <span className="text-sm font-semibold text-br-pearl truncate">
            Boy&apos;s Roofing
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </header>

        {/* Overlay + panel del menú móvil */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <nav
              className="md:hidden fixed top-0 right-0 z-50 h-full w-[min(100%,280px)] flex flex-col bg-br-smoke/95 border-l border-white/5 shadow-2xl backdrop-blur-sm"
              aria-label="Menú principal"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-xl font-bold tracking-tight text-br-red-main">Boy&apos;s Roofing</h2>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-lg text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition"
                  aria-label="Cerrar menú"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-xs text-br-pearl/80 px-6 pb-3">Panel de administración · ES</p>
              <div className="flex-1 overflow-y-auto py-2 px-4 space-y-0.5 text-sm">
                {mobileNavLink("/admin/es/dashboard", "Dashboard", HomeIcon)}
                {mobileNavLink("/admin/es/quotes", "Cotizaciones", DocumentTextIcon)}
                {mobileNavLink("/admin/es/crear-factura", "Crear factura", DocumentPlusIcon)}
                {mobileNavLink("/admin/es/medir", "Medir", MapPinIcon)}
                {mobileNavLink("/admin/es/nomina/trabajadores", "Trabajadores", UserGroupIcon)}
                {mobileNavLink("/admin/es/nomina", "Nómina", BanknotesIcon, true)}
                {mobileNavLink("/admin/es/nomina/balances", "Balances / Deudas", CurrencyDollarIcon)}
                {mobileNavLink("/admin/es/recibos", "Recibos de pago", DocumentCheckIcon)}
                {mobileNavLink("/admin/es/imagenes-sitio", "Imágenes del sitio", PhotoIcon)}
                {mobileNavLink("/admin/es/proyectos", "Proyectos / Mapa", BuildingOffice2Icon)}
              </div>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 admin-btn-primary text-white py-2.5 px-4 rounded-xl text-sm font-semibold"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </>
        )}

        <main className="flex-1 p-4 md:p-8 admin-mesh">
          <div className="relative min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
