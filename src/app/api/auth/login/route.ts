import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import {
  createAuthToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const email = body.email
      ?.trim()
      .toLowerCase();

    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const user = await User.findOne({
      email,
    }).select("+password") .lean();

    console.log("LOGIN_API: Raw user:", user);
    console.log(
      "LOGIN_API: Email:",
      user?.email,
    );
    console.log(
      "LOGIN_API: Password exists:",
      !!user?.password,
    );
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is currently inactive.",
        },
        {
          status: 403,
        },
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * Create JWT using the MongoDB user ID.
     */
    const token =
      await createAuthToken(
        user._id.toString(),
      );

    /*
     * Create response.
     */
    const response =
      NextResponse.json({
        success: true,
        message: "Login successful.",

        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });

    /*
     * Store JWT inside HTTP-only cookie.
     */
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        60 * 60 * 24 * 7,
    });

    console.log(
      "LOGIN_API: Login successful for:",
      user.email,
    );

    console.log(
      "LOGIN_API: Auth cookie created.",
    );

    return response;
  } catch (error) {
    console.error(
      "LOGIN_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while signing in.",
      },
      {
        status: 500,
      },
    );
  }
}