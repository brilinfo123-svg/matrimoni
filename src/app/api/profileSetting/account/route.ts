import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);
  return session?.userId ?? null;
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
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
export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    let body: { action?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    if (body.action !== "deactivate" && body.action !== "activate") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid account action.",
          },
          { status: 400 }
        );
      }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection is not available.");
    }

    const isActivating = body.action === "activate";

        const result = await db.collection("users").updateOne(
        {
            _id: new mongoose.Types.ObjectId(userId),
        },
        {
            $set: {
            isActive: isActivating,
            updatedAt: new Date(),
            },
        }
        );

        if (result.matchedCount === 0) {
        return NextResponse.json(
            { success: false, message: "Account not found." },
            { status: 404 }
        );
        }

        return NextResponse.json({
        success: true,
        message: isActivating
            ? "Account activated successfully."
            : "Account deactivated successfully.",
        });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
        success: true,
        message: "Account deactivated successfully.",
      });

  } catch (error) {
    console.error(
      "POST /api/profileSetting/account error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to deactivate account.",
      },
      { status: 500 },
    );
  }
}

// DELETE: Permanently delete the user document
export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection is not available.");
    }

    const result = await db.collection("users").deleteOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });

    return clearSessionCookie(response);
  } catch (error) {
    console.error(
      "DELETE /api/profileSetting/account error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete account.",
      },
      { status: 500 },
    );
  }
}