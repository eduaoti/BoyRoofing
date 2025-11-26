"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminENLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("br_admin_token");
    router.push("/admin/en/login");
  }

  return (
    <div className="flex min-h-screen bg-br-carbon text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-br-smoke p-6 border-r border-br-red-main flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-br-red-main mb-8">Admin Panel</h2>

          <nav className="space-y-4">
            <Link className="block hover:text-br-red-main" href="/admin/en/dashboard">
              Dashboard
            </Link>
            <Link className="block hover:text-br-red-main" href="/admin/en/quotes">
              Quotes
            </Link>
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="mt-6 w-full bg-br-red-main hover:bg-br-red-dark text-white py-2 px-4 rounded transition"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
