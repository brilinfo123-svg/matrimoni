import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const mobile = String(body.mobile || "")
      .replace(/\D/g, "")
      .trim();

    if (!email && !mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or mobile number is required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const [emailExists, mobileExists] =
      await Promise.all([
        email
          ? User.exists({ email })
          : Promise.resolve(null),

        mobile
          ? User.exists({ mobile })
          : Promise.resolve(null),
      ]);

    return NextResponse.json({
      success: true,
      emailExists: !!emailExists,
      mobileExists: !!mobileExists,
    });
  } catch (error) {
    console.error(
      "CHECK_AVAILABILITY_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to check account availability. Please try again.",
      },
      { status: 500 },
    );
  }
}
