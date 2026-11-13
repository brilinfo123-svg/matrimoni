import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import {
  createAuthToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

// Only allow trusted frontend origins.
const ALLOWED_ORIGINS = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "https://evermilan.vercel.app",
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";

  const headers = new Headers();

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  headers.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS",
  );

  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

// Handle browser preflight requests.
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email
      ?.trim()
      .toLowerCase();

    const password = body.password;

    if (
      !email ||
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        {
          status: 400,
          headers: getCorsHeaders(request),
        },
      );
    }

    await connectDB();

    const user = await User.findOne({
      email,
    })
      .select("+password")
      .lean();

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
          headers: getCorsHeaders(request),
        },
      );
    }

    // Verify password.
    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
          headers: getCorsHeaders(request),
        },
      );
    }

    // Preserve inactive account handling.
    const isActive = user.isActive !== false;

    // Create JWT.
    const token = await createAuthToken(
      user._id.toString(),
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive,
        },
        redirectTo: isActive
          ? "/dashboard"
          : "/account-deactivated",
      },
      {
        status: 200,
        headers: getCorsHeaders(request),
      },
    );

    // Set session cookie.
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log(
      "LOGIN_API: Login successful for:",
      user.email,
    );

    console.log(
      "LOGIN_API: Account active:",
      isActive,
    );

    console.log(
      "LOGIN_API: Auth cookie created.",
    );

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while signing in.",
      },
      {
        status: 500,
        headers: getCorsHeaders(request),
      },
    );
  }
}