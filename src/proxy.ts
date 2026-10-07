import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/search",
  "/messages",
  "/matches",

  // Protect all profile pages
  "/profile",

  "/settings",
];

export async function proxy(
  req: NextRequest,
) {
  const pathname = req.nextUrl.pathname;

  /*
   * Check if current route is protected.
   */
  const isProtectedRoute =
    protectedRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`),
    );

  /*
   * Public route hai to directly allow karo.
   */
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  /*
   * Custom JWT cookie read karo.
   */
  const token = req.cookies.get(
    AUTH_COOKIE_NAME,
  )?.value;

  /*
   * Cookie nahi hai = user logged out.
   */
  if (!token) {
    console.log(
      "PROXY: No auth cookie for:",
      pathname,
    );

    const loginUrl = new URL(
      "/login",
      req.url,
    );

    /*
     * Login ke baad original page par
     * redirect karne ke liye callbackUrl.
     */
    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + req.nextUrl.search,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  /*
   * JWT verify karo.
   */
  const session =
    await verifyAuthToken(token);

  /*
   * Invalid / expired JWT.
   */
  if (!session) {
    console.log(
      "PROXY: Invalid or expired session for:",
      pathname,
    );

    const loginUrl = new URL(
      "/login",
      req.url,
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + req.nextUrl.search,
    );

    /*
     * Invalid cookie remove kar do.
     */
    const response =
      NextResponse.redirect(loginUrl);

    response.cookies.delete(
      AUTH_COOKIE_NAME,
    );

    return response;
  }

  /*
   * User authenticated hai.
   */
  console.log(
    "PROXY: Authenticated user:",
    session.userId,
    "Route:",
    pathname,
  );

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/search/:path*",
    "/messages/:path*",
    "/matches/:path*",

    /*
     * Protect:
     * /profile/[id]
     * /profile/edit
     * /profile/preview
     * and any future /profile/* routes
     */
    "/profile/:path*",

    "/settings/:path*",
  ],
};
