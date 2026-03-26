import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/createClient";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public Routes
  const isPublicRoute = 
    pathname === "/" || 
    pathname.startsWith("/api/");
    
  // Auth Pages
  const isAuthPage = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register");

  // Protected Routes
  const protectedRoutes = ["/profile", "/schemes", "/loans", "/categories", "/news", "/chatbot"];

  let isAuthenticated = false;

  // Read the manually synced cookie from AuthContext
  const accessToken = request.cookies.get("sb-access-token")?.value;

  if (accessToken) {
    try {
      // Verify the token using the existing basic client
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error("Error verifying Supabase token in middleware", e);
    }
  }

  // 1. Handle Unauthenticated Access
  if (!isAuthenticated) {
    if (!isPublicRoute && !isAuthPage) {
       // Check if the current path matches any protected route pattern
       if (protectedRoutes.some(route => pathname.startsWith(route))) {
           const url = request.nextUrl.clone();
           url.pathname = '/login';
           return NextResponse.redirect(url);
       }
    }
  }

  // 2. Handle Authenticated Access
  if (isAuthenticated) {
      // Restrict User Auth Pages if already logged in
      if (isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/profile';
        return NextResponse.redirect(url);
      }
  }

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
