// app/admin/es/(panel)/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPinIcon, HomeIcon, DocumentTextIcon, DocumentPlusIcon, ArrowRightOnRectangleIcon, UserGroupIcon, BanknotesIcon, Bars3Icon, XMarkIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

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

  return (
    <div className="min-h-screen flex bg-br-carbon text-white">
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
              className="md:hidden fixed top-0 right-0 z-50 h-full w-[min(100%,280px)] flex flex-col bg-br-smoke border-l border-br-smoke-light shadow-2xl"
              aria-label="Menú principal"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-br-smoke-light">
                <h2 className="text-lg font-bold text-br-red-main">Menú</h2>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-lg text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition"
                  aria-label="Cerrar menú"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <Link href="/admin/es/dashboard" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <HomeIcon className="h-5 w-5 shrink-0" /> Dashboard
                </Link>
                <Link href="/admin/es/quotes" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <DocumentTextIcon className="h-5 w-5 shrink-0" /> Cotizaciones
                </Link>
                <Link href="/admin/es/crear-factura" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <DocumentPlusIcon className="h-5 w-5 shrink-0" /> Crear factura
                </Link>
                <Link href="/admin/es/medir" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <MapPinIcon className="h-5 w-5 shrink-0" /> Medir
                </Link>
                <Link href="/admin/es/nomina/trabajadores" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <UserGroupIcon className="h-5 w-5 shrink-0" /> Trabajadores
                </Link>
                <Link href="/admin/es/nomina" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <BanknotesIcon className="h-5 w-5 shrink-0" /> Nómina
                </Link>
                <Link href="/admin/es/nomina/balances" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <CurrencyDollarIcon className="h-5 w-5 shrink-0" /> Balances / Deudas
                </Link>
              </div>
              <div className="p-3 border-t border-br-smoke-light">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 bg-br-red-main hover:bg-br-red-light text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition"
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
