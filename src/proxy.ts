import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/search",
  "/messages",
  "/matches",
  "/profile/edit",
  "/profile/preview",
  "/settings",
];

export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL(
      "/login",
      req.nextUrl.origin,
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + req.nextUrl.search,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/search/:path*",
    "/messages/:path*",
    "/matches/:path*",
    "/profile/edit/:path*",
    "/profile/preview/:path*",
    "/settings/:path*",
  ],
};