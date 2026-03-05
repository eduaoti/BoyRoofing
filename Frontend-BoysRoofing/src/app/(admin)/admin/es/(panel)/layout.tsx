// app/admin/es/(panel)/layout.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPinIcon, HomeIcon, DocumentTextIcon, DocumentPlusIcon, ArrowRightOnRectangleIcon, UserGroupIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function AdminESPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("br_admin_token");

    // Borrar cookie (Secure=false NO es válido en cookies)
    document.cookie = "br_admin_token=; Max-Age=0; path=/; SameSite=Lax";

    router.push("/admin/es/login");
  }

  return (
    <div className="min-h-screen flex bg-br-carbon text-white">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-br-smoke/90 border-r border-br-smoke-light px-6 py-6 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-br-red-main mb-1">
            Boy&apos;s Roofing
          </h2>
          <p className="text-xs text-br-pearl/80 mb-8">
            Panel de administración · ES
          </p>

          <nav className="space-y-1 text-sm">
            <Link
              href="/admin/es/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              <HomeIcon className="h-5 w-5 shrink-0" />
              Dashboard
            </Link>
            <Link
              href="/admin/es/quotes"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              <DocumentTextIcon className="h-5 w-5 shrink-0" />
              Cotizaciones
            </Link>
            <Link
              href="/admin/es/crear-factura"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              <DocumentPlusIcon className="h-5 w-5 shrink-0" />
              Crear factura
            </Link>
            <Link
              href="/admin/es/medir"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              <MapPinIcon className="h-5 w-5 shrink-0" />
              Medir
            </Link>
            <Link
              href="/admin/es/nomina/trabajadores"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              <UserGroupIcon className="h-5 w-5 shrink-0" />
              Trabajadores
            </Link>
            <Link
              href="/admin/es/nomina"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              <BanknotesIcon className="h-5 w-5 shrink-0" />
              Nómina
            </Link>
            <Link
              href="/admin/es/nomina/balances"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              Balances / Deudas
            </Link>
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-br-red-main hover:bg-br-red-light text-white py-2 px-4 rounded-lg text-sm font-semibold transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </button>
      </aside>

      {/* MOBILE TOPBAR + CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-br-smoke-light bg-br-smoke/90">
          <span className="text-sm font-semibold">
            Boy&apos;s Roofing · Administrador
          </span>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/es/crear-factura"
              className="flex items-center gap-1.5 text-xs rounded-full border border-br-smoke-light px-3 py-1.5 hover:bg-br-carbon/60"
            >
              <DocumentPlusIcon className="h-4 w-4" />
              Crear factura
            </Link>
            <Link
              href="/admin/es/medir"
              className="flex items-center gap-1.5 text-xs rounded-full border border-br-smoke-light px-3 py-1.5 hover:bg-br-carbon/60"
            >
              <MapPinIcon className="h-4 w-4" />
              Medir
            </Link>

            <button
              onClick={logout}
              className="text-xs rounded-full bg-br-red-main px-3 py-1"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
