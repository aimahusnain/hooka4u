// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login", "/register"]; // allowed without login
const DASHBOARD_ROUTES = ["/admin-dashboard", "/dashboard"]; // protected routes

// Role-based allowed routes
const USER_ALLOWED_ROUTES = [
  "/dashboard/menu",
  "/dashboard/users-management",
];
const ADMIN_ALLOWED_ROUTES = [
  ...USER_ALLOWED_ROUTES, // Admin can access everything user can
  "/admin-dashboard",     // example admin route
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // --------------------------
  // 1️⃣ If logged in
  // --------------------------
  if (token) {
    const role = token.role; // make sure you store role in JWT

    // Redirect logged-in user if they try to access login page
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based access control
    if (role === "user") {
      // Allow only the user-allowed routes inside dashboard
      const allowed = USER_ALLOWED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );
      if (!allowed && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/dashboard/menu", req.url));
      }
    }

    if (role === "admin") {
      // Admin can access all admin routes
      const allowed = ADMIN_ALLOWED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );
      if (!allowed && pathname.startsWith("/admin-dashboard")) {
        return NextResponse.redirect(new URL("/admin-dashboard", req.url));
      }
    }

    return NextResponse.next();
  }

  // --------------------------
  // 2️⃣ If NOT logged in
  // --------------------------
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isProtected = DASHBOARD_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isPublic && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/admin-dashboard/:path*",
  ],
};
