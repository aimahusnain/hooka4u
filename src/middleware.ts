// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login", "/register"];
const DASHBOARD_ROUTES = ["/admin-dashboard", "/dashboard"];
const RESTRICTED_FOR_USER = [
  "/dashboard/menu",
  "/dashboard/users-management"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userRole = token?.role; // assuming your token has a 'role' property

  // --------------------------
  // 1️⃣ If logged in
  // --------------------------
  if (token) {
    // Redirect logged-in user if they try to access login
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based restrictions
    if (userRole === "USER") {
      if (RESTRICTED_FOR_USER.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin can access everything
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
    "/dashboard/:path*",
  ],
};
