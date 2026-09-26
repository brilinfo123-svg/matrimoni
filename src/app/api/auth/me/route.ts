import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      "matrimonial_session",
    )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload?.userId) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(payload.userId).select(
      "-password",
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("ME_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        user: null,
      },
      { status: 500 },
    );
  }
}