import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import PasswordReset from "@/models/PasswordReset";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email
      ?.trim()
      .toLowerCase();

    const otp = body.otp
      ?.trim();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and verification code are required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const resetRequest =
      await PasswordReset.findOne({
        email,
      });

    if (!resetRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code is invalid or expired.",
        },
        { status: 400 },
      );
    }

    if (
      resetRequest.expiresAt.getTime() <
      Date.now()
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired.",
        },
        { status: 400 },
      );
    }

    if (resetRequest.attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new code.",
        },
        { status: 429 },
      );
    }

    const isValid = await bcrypt.compare(
      otp,
      resetRequest.otpHash,
    );

    if (!isValid) {
      resetRequest.attempts += 1;
      await resetRequest.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification code.",
        },
        { status: 400 },
      );
    }

    resetRequest.verified = true;

    await resetRequest.save();

    return NextResponse.json({
      success: true,
      message:
        "Verification code verified successfully.",
    });
  } catch (error) {
    console.error(
      "VERIFY_RESET_OTP_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify the code.",
      },
      { status: 500 },
    );
  }
}