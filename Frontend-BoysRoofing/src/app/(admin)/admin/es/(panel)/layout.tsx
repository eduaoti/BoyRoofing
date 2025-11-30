// app/admin/es/(panel)/layout.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminESPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("br_admin_token");
    document.cookie =
      "br_admin_token=; Max-Age=0; path=/; SameSite=Lax; Secure=false;";
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

          <nav className="space-y-3 text-sm">
            <Link
              href="/admin/es/dashboard"
              className="block rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/es/quotes"
              className="block rounded-lg px-3 py-2 hover:bg-br-carbon/60 hover:text-br-red-main transition"
            >
              Cotizaciones
            </Link>
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full bg-br-red-main hover:bg-br-red-light text-white py-2 px-4 rounded-lg text-sm font-semibold transition"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* MOBILE TOPBAR + CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-br-smoke-light bg-br-smoke/90">
          <span className="text-sm font-semibold">
            Boy&apos;s Roofing · Administrador
          </span>

          <button
            onClick={logout}
            className="text-xs rounded-full bg-br-red-main px-3 py-1"
          >
            Cerrar sesión
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
