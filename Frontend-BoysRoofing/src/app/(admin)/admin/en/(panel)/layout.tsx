// app/admin/en/(panel)/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPinIcon, HomeIcon, DocumentTextIcon, DocumentPlusIcon, ArrowRightOnRectangleIcon, UserGroupIcon, BanknotesIcon, Bars3Icon, XMarkIcon, CurrencyDollarIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";

export default function AdminENPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("br_admin_token");
    document.cookie = "br_admin_token=; Max-Age=0; path=/; SameSite=Lax; Secure=false;";
    setMobileMenuOpen(false);
    router.push("/admin/en/login");
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
    <div className="min-h-screen flex bg-br-carbon text-white no-print">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-br-smoke/95 border-r border-white/5 px-6 py-6 shadow-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-br-red-main mb-1">
            Boy&apos;s Roofing
          </h2>
          <p className="text-xs text-br-pearl/80 mb-8">
            Admin dashboard · EN
          </p>

          <nav className="space-y-0.5 text-sm">
            {navLink("/admin/en/dashboard", "Dashboard", HomeIcon)}
            {navLink("/admin/en/quotes", "Quotes", DocumentTextIcon)}
            {navLink("/admin/en/create-invoice", "Create invoice", DocumentPlusIcon)}
            {navLink("/admin/en/medir", "Measure", MapPinIcon)}
            {navLink("/admin/en/payroll/workers", "Workers", UserGroupIcon)}
            {navLink("/admin/en/payroll", "Payroll", BanknotesIcon, true)}
            {navLink("/admin/en/payroll/balances", "Balances", CurrencyDollarIcon)}
            {navLink("/admin/en/receipts", "Payment receipts", DocumentCheckIcon)}
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 admin-btn-primary text-white py-2.5 px-4 rounded-xl text-sm font-semibold"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Log out
        </button>
      </aside>

      {/* MOBILE: navbar + hamburger menu */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-br-smoke-light bg-br-smoke/95 backdrop-blur">
          <span className="text-sm font-semibold text-br-pearl truncate">
            Boy&apos;s Roofing
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </header>

        {/* Overlay + mobile menu panel */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <nav
              className="md:hidden fixed top-0 right-0 z-50 h-full w-[min(100%,280px)] flex flex-col bg-br-smoke border-l border-br-smoke-light shadow-2xl"
              aria-label="Main menu"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-br-smoke-light">
                <h2 className="text-lg font-bold text-br-red-main">Menu</h2>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-lg text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <Link href="/admin/en/dashboard" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <HomeIcon className="h-5 w-5 shrink-0" /> Dashboard
                </Link>
                <Link href="/admin/en/quotes" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <DocumentTextIcon className="h-5 w-5 shrink-0" /> Quotes
                </Link>
                <Link href="/admin/en/create-invoice" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <DocumentPlusIcon className="h-5 w-5 shrink-0" /> Create invoice
                </Link>
                <Link href="/admin/en/medir" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <MapPinIcon className="h-5 w-5 shrink-0" /> Measure
                </Link>
                <Link href="/admin/en/payroll/workers" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <UserGroupIcon className="h-5 w-5 shrink-0" /> Workers
                </Link>
                <Link href="/admin/en/payroll" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <BanknotesIcon className="h-5 w-5 shrink-0" /> Payroll
                </Link>
                <Link href="/admin/en/payroll/balances" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <CurrencyDollarIcon className="h-5 w-5 shrink-0" /> Balances
                </Link>
                <Link href="/admin/en/receipts" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-br-pearl hover:bg-br-carbon/60 hover:text-br-red-main transition">
                  <DocumentCheckIcon className="h-5 w-5 shrink-0" /> Payment receipts
                </Link>
              </div>
              <div className="p-3 border-t border-br-smoke-light">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 bg-br-red-main hover:bg-br-red-light text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Log out
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
