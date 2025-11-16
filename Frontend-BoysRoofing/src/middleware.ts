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
    // 👇 El token se toma de las COOKIES
    const token = request.cookies.get("br_admin_token")?.value;

    if (!token) {
      // si no hay token, manda al login EN por defecto
      return NextResponse.redirect(new URL("/admin/en/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
