import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email
      ?.trim()
      .toLowerCase();

    const otp = body.otp?.trim();
    const password = body.password;

    if (!email || !otp || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, verification code and password are required.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
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
            "Password reset request is invalid or expired.",
        },
        { status: 400 },
      );
    }

    if (!resetRequest.verified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify the OTP first.",
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
            "Password reset request has expired.",
        },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to reset password.",
        },
        { status: 400 },
      );
    }

    // Hash new password.
    const hashedPassword =
      await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    await user.save();

    // OTP can no longer be used.
    await PasswordReset.deleteOne({
      _id: resetRequest._id,
    });

    return NextResponse.json({
      success: true,
      message:
        "Password has been changed successfully.",
    });
  } catch (error) {
    console.error(
      "RESET_PASSWORD_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to reset your password.",
      },
      { status: 500 },
    );
  }
}