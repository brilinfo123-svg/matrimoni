
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import {
  createAuthToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

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
        },
      );
    }

    // Verify the password for both active and inactive accounts.
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
        },
      );
    }

    // Do not block inactive users at login.
    const isActive = user.isActive !== false;

    // Create JWT using the MongoDB user ID.
    const token = await createAuthToken(
      user._id.toString(),
    );

    // Preserve the existing login response and add account status.
    const response = NextResponse.json({
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
    });

    // Preserve the existing HTTP-only session cookie settings.
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
      },
    );
  }
}