// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login", "/register"];
const RESTRICTED_FOR_USER = [
  "/dashboard/menu",
  "/dashboard/users-management",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If user is logged in
  if (token) {
    const role = token.role;

    // Prevent logged user from going to login page again
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Restrict user role from certain pages only
if (role === "USER") {
  if (
    RESTRICTED_FOR_USER.some((route) =>
      pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}


    // Otherwise allow access
    return NextResponse.next();
  }

  // If NOT logged in
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!isPublic && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};
