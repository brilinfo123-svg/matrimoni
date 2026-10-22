
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("matrimonial_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return typeof payload.userId === "string"
      ? payload.userId
      : null;
  } catch {
    return null;
  }
}

function clearSession(response: NextResponse) {
  response.cookies.set({
    name: "matrimonial_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

// POST: Deactivate account
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (body.action !== "deactivate") {
      return NextResponse.json(
        { success: false, message: "Invalid account action." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Account deactivated successfully.",
    });

    return clearSession(response);
  } catch (error) {
    console.error("Account deactivation error:", error);

    return NextResponse.json(
      { success: false, message: "Could not deactivate account." },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete account
export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in again." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });

    return clearSession(response);
  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      { success: false, message: "Could not delete account." },
      { status: 500 }
    );
  }
}