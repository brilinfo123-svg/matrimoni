
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { sendPasswordResetOtp } from "@/lib/email";

import {
  handleCorsOptions,
  addCorsHeaders,
} from "@/lib/cors";

// Handle browser CORS preflight request.
export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email
      ?.trim()
      .toLowerCase();

    if (!email) {
      return addCorsHeaders(
        request,
        NextResponse.json(
          {
            success: false,
            message: "Email address is required.",
          },
          { status: 400 },
        ),
      );
    }

    await connectDB();

    const user = await User.findOne({
      email,
    });

    // Don't reveal whether email exists.
    if (!user) {
      return addCorsHeaders(
        request,
        NextResponse.json({
          success: true,
          message:
            "If an account exists with this email, a verification code has been sent.",
        }),
      );
    }

    if (user.isActive === false) {
      return addCorsHeaders(
        request,
        NextResponse.json({
          success: true,
          message:
            "If an account exists with this email, a verification code has been sent.",
        }),
      );
    }

    // Generate 6 digit OTP.
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash OTP before storing it.
    const otpHash = await bcrypt.hash(
      otp,
      10,
    );

    // Delete previous reset requests.
    await PasswordReset.deleteMany({
      email,
    });

    await PasswordReset.create({
      email,
      otpHash,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000,
      ),
      attempts: 0,
      verified: false,
    });

    await sendPasswordResetOtp(
      email,
      otp,
    );

    return addCorsHeaders(
      request,
      NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a verification code has been sent.",
      }),
    );
  } catch (error) {
    console.error(
      "FORGOT_PASSWORD_API_ERROR:",
      error,
    );

    return addCorsHeaders(
      request,
      NextResponse.json(
        {
          success: false,
          message:
            "Unable to process your request.",
        },
        { status: 500 },
      ),
    );
  }
}