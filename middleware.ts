import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession, decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public Routes (Login, Register, Home) — skip session refresh
  const isPublicRoute = 
    pathname === "/" || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/api/auth");

  // Only refresh session on non-public routes
  if (!isPublicRoute) {
    const response = await updateSession(request);
    if (response) return response;
  }

  const session = request.cookies.get("session")?.value;

  // Protected Routes (Add more as needed)
  const protectedRoutes = ["/profile", "/schemes", "/loans", "/categories", "/news"];

  // Admin Routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminPublicRoute = pathname.startsWith("/admin/login") || pathname.startsWith("/admin/register");
  const isAdminProtected = isAdminRoute && !isAdminPublicRoute;

  // 1. Handle Unauthenticated Access
  if (!session) {
    if (isAdminProtected) {
       return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isPublicRoute && !isAdminPublicRoute) {
       // Check if the current path matches any protected route pattern
       if (protectedRoutes.some(route => pathname.startsWith(route))) {
           return NextResponse.redirect(new URL("/login", request.url));
       }
    }
  }

  // 2. Handle Authenticated Access
  if (session) {
      // Decode session to check role
      const payload = await decrypt(session);
      const role = payload?.role;

      // Restrict Admin Routes
      if (isAdminProtected && role !== "admin") {
          // If not admin, redirect to user home
          return NextResponse.redirect(new URL("/profile", request.url));
      }

      // Restrict Admin Auth Pages if already logged in as admin
      if (isAdminPublicRoute && role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      // Restrict User Auth Pages if logged in
      if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && (role === "user" || !role)) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
  }

  // NOTE: In a real app, you would check session payload or DB to see if profile is complete.
  // Since we don't have easy DB access in Edge middleware without external services,
  // we rely on the frontend redirect logic or a simpler check if possible.
  // For now, we allow access to /profile/setup if authenticated.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
