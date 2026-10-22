// import { NextRequest, NextResponse } from "next/server";

// import {
//   AUTH_COOKIE_NAME,
//   verifyAuthToken,
// } from "@/lib/auth";

// const protectedRoutes = [
//   "/dashboard",
//   "/search",
//   "/messages",
//   "/matches",

//   // Protect all profile pages
//   "/profile",

//   "/settings",
// ];

// export async function proxy(
//   req: NextRequest,
// ) {
//   const pathname = req.nextUrl.pathname;

//   /*
//    * Check if current route is protected.
//    */
//   const isProtectedRoute =
//     protectedRoutes.some(
//       (route) =>
//         pathname === route ||
//         pathname.startsWith(`${route}/`),
//     );

//   /*
//    * Public route hai to directly allow karo.
//    */
//   if (!isProtectedRoute) {
//     return NextResponse.next();
//   }

//   /*
//    * Custom JWT cookie read karo.
//    */
//   const token = req.cookies.get(
//     AUTH_COOKIE_NAME,
//   )?.value;

//   /*
//    * Cookie nahi hai = user logged out.
//    */
//   if (!token) {
//     console.log(
//       "PROXY: No auth cookie for:",
//       pathname,
//     );

//     const loginUrl = new URL(
//       "/login",
//       req.url,
//     );

//     /*
//      * Login ke baad original page par
//      * redirect karne ke liye callbackUrl.
//      */
//     loginUrl.searchParams.set(
//       "callbackUrl",
//       pathname + req.nextUrl.search,
//     );

//     return NextResponse.redirect(
//       loginUrl,
//     );
//   }

//   /*
//    * JWT verify karo.
//    */
//   const session =
//     await verifyAuthToken(token);

//   /*
//    * Invalid / expired JWT.
//    */
//   if (!session) {
//     console.log(
//       "PROXY: Invalid or expired session for:",
//       pathname,
//     );

//     const loginUrl = new URL(
//       "/login",
//       req.url,
//     );

//     loginUrl.searchParams.set(
//       "callbackUrl",
//       pathname + req.nextUrl.search,
//     );

//     /*
//      * Invalid cookie remove kar do.
//      */
//     const response =
//       NextResponse.redirect(loginUrl);

//     response.cookies.delete(
//       AUTH_COOKIE_NAME,
//     );

//     return response;
//   }

//   /*
//    * User authenticated hai.
//    */
//   console.log(
//     "PROXY: Authenticated user:",
//     session.userId,
//     "Route:",
//     pathname,
//   );

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/search/:path*",
//     "/messages/:path*",
//     "/matches/:path*",

//     /*
//      * Protect:
//      * /profile/[id]
//      * /profile/edit
//      * /profile/preview
//      * and any future /profile/* routes
//      */
//     "/profile/:path*",

//     "/settings/:path*",
//   ],
// };

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

const protectedRoutes = [
  "/dashboard",
  "/search",
  "/messages",
  "/matches",
  "/profile",
  "/settings",
];

const deactivatedRoute = "/account-deactivated";

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);

  loginUrl.searchParams.set(
    "callbackUrl",
    req.nextUrl.pathname + req.nextUrl.search
  );

  return NextResponse.redirect(loginUrl);
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected = isProtectedRoute(pathname);

  // The activation page must always remain accessible.
  if (pathname === deactivatedRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Preserve existing protection for logged-out users.
  if (!token) {
    if (isProtected) {
      return redirectToLogin(req);
    }

    return NextResponse.next();
  }

  const session = await verifyAuthToken(token);

  // Invalid session: preserve the existing login redirect for protected pages.
  if (!session?.userId) {
    if (isProtected) {
      const response = redirectToLogin(req);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    // Clear an invalid cookie without blocking public pages.
    const response = NextResponse.next();
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // Check the account status for authenticated page requests.
  try {
    await connectDB();

    const db = mongoose.connection.db;

    if (!db || !mongoose.Types.ObjectId.isValid(session.userId)) {
      console.error("PROXY: Database unavailable or invalid user ID.");
      return new NextResponse("Unable to verify account status.", {
        status: 503,
      });
    }

    const user = await db.collection("users").findOne(
      { _id: new mongoose.Types.ObjectId(session.userId) },
      { projection: { isActive: 1 } }
    );

    // A deleted account must not continue browsing with an old session.
    if (!user) {
      const response = redirectToLogin(req);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    // Missing isActive is treated as active for legacy accounts.
    const isActive = user.isActive !== false;

    if (!isActive) {
      const redirectUrl = new URL(deactivatedRoute, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("PROXY: Account status check failed:", error);

    // Fail closed on protected pages rather than bypassing account checks.
    if (isProtected) {
      return new NextResponse("Unable to verify account status.", {
        status: 503,
      });
    }

    // Do not break public pages because of a temporary DB error.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on frontend pages so inactive users cannot bypass the
     * deactivated screen by navigating to another public page.
     * API routes and Next.js static/image assets are excluded.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
