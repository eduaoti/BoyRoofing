"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // Convierte segmentos en texto más bonito
  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-xs sm:text-sm text-gray-400 gap-2"
    >
      {/* HOME */}
      <Link
        href="/"
        className="font-medium text-gray-300 hover:text-red-500 transition-colors"
      >
        Home
      </Link>

      {parts.map((segment, index) => {
        const href = "/" + parts.slice(0, index + 1).join("/");
        const isLast = index === parts.length - 1;

        return (
          <span key={href} className="inline-flex items-center gap-2">
            {/* Separador */}
            <span className="text-gray-600">›</span>

            {/* Último item: solo texto */}
            {isLast ? (
              <span className="font-semibold text-white">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-red-500 transition-colors"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
