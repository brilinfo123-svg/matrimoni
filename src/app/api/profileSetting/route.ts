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

function isValidUserId(userId: string) {
  return mongoose.Types.ObjectId.isValid(userId);
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !isValidUserId(userId)) {
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

    const user = await db.collection("users").findOne(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      {
        projection: {
          password: 0,
          email: 0,
          mobile: 0,
        },
      },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        isMobileVisible: user.isMobileVisible ?? true,
        isActive: user.isActive ?? true,
      },
    });
  } catch (error) {
    console.error("GET /api/profileSetting error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !isValidUserId(userId)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    let body: { isMobileVisible?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 },
      );
    }

    if (typeof body.isMobileVisible !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isMobileVisible must be true or false.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection is not available.");
    }

    const result = await db.collection("users").updateOne(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      {
        $set: {
          isMobileVisible: body.isMobileVisible,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      profile: {
        isMobileVisible: body.isMobileVisible,
      },
    });
  } catch (error) {
    console.error("PATCH /api/profileSetting error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update settings." },
      { status: 500 },
    );
  }
}