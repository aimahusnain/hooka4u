// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login", "/register"]; // allowed without login
const DASHBOARD_ROUTES = ["/admin-dashboard", "/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // --------------------------
  // 1️⃣ If logged in
  // --------------------------
  if (token) {
    // Redirect logged-in user if they try to access login or home
    if (pathname === "/login") {
      const redirectTo = "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    return NextResponse.next();
  }

  // --------------------------
  // 2️⃣ If NOT logged in
  // --------------------------
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isDashboard = DASHBOARD_ROUTES.some((route) => pathname.startsWith(route));

  if (!isPublic && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login", 
    "/register", 
    "/admin-dashboard/:path*", 
    "/dashboard/:path*"
  ],
};
