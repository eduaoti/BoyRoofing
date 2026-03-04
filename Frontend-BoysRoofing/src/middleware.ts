// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute =
    pathname.startsWith("/admin/en/login") ||
    pathname.startsWith("/admin/es/login");

  if (isAdminRoute && !isLoginRoute) {
    const token = request.cookies.get("br_admin_token")?.value;

    if (!token) {
      // ✅ Respeta idioma según la ruta actual
      const lang = pathname.startsWith("/admin/es") ? "es" : "en";
      return NextResponse.redirect(new URL(`/admin/${lang}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
