
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri);
}

async function getAuthenticatedUserId(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const session = await verifyAuthToken(token);

    return session?.userId ? String(session.userId) : null;
  } catch {
    return null;
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status },
  );
}

/**
 * GET: Load the logged-in user's favorite profile IDs.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return errorResponse(
        "Please log in to view favorites.",
        401,
      );
    }

    await connectDB();

    const user = await User.findById(userId)
      .select("favorites")
      .lean();

    if (!user) {
      return errorResponse("User not found.", 404);
    }

    const favoriteIds = Array.isArray(user.favorites)
      ? user.favorites.map((id) => String(id))
      : [];

    return NextResponse.json({
      success: true,
      favoriteIds,
    });
  } catch (error) {
    console.error("GET_FAVORITES_ERROR:", error);

    return errorResponse(
      "Unable to load favorites.",
      500,
    );
  }
}

/**
 * POST: Add or remove a favorite profile.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return errorResponse(
        "Please log in to update favorites.",
        401,
      );
    }

    const body = await request.json().catch(() => null);

    const profileId = body?.profileId;
    const action = body?.action;

    if (
      typeof profileId !== "string" ||
      !mongoose.isValidObjectId(profileId)
    ) {
      return errorResponse(
        "A valid profile ID is required.",
        400,
      );
    }

    if (action !== "add" && action !== "remove") {
      return errorResponse(
        "Action must be add or remove.",
        400,
      );
    }

    if (userId === profileId) {
      return errorResponse(
        "You cannot favorite your own profile.",
        400,
      );
    }

    await connectDB();

    // Verify that the target profile exists.
    const targetExists = await User.exists({
      _id: profileId,
    });

    if (!targetExists) {
      return errorResponse("Profile not found.", 404);
    }

    // Ensure the logged-in user exists.
    const currentUserExists = await User.exists({
      _id: userId,
    });

    if (!currentUserExists) {
      return errorResponse("User not found.", 404);
    }

    const favoriteObjectId =
      new mongoose.Types.ObjectId(profileId);

    // Create favorites only when the field is missing.
    // Existing favorite entries remain unchanged.
    await User.updateOne(
      {
        _id: userId,
        favorites: { $exists: false },
      },
      {
        $set: { favorites: [] },
      },
    );

    // Add without duplicates, or remove the requested profile.
    if (action === "add") {
      await User.updateOne(
        { _id: userId },
        {
          $addToSet: {
            favorites: favoriteObjectId,
          },
        },
      );
    } else {
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            favorites: favoriteObjectId,
          },
        },
      );
    }

    // Fetch the latest favorites from MongoDB.
    const updatedUser = await User.findById(userId)
      .select("favorites")
      .lean();

    if (!updatedUser) {
      return errorResponse("User not found.", 404);
    }

    const favoriteIds = Array.isArray(
      updatedUser.favorites,
    )
      ? updatedUser.favorites.map((id) => String(id))
      : [];

    return NextResponse.json({
      success: true,
      favoriteIds,
    });
  } catch (error) {
    console.error("POST_FAVORITES_ERROR:", error);

    if (error instanceof Error) {
      console.error(
        "POST_FAVORITES_ERROR_MESSAGE:",
        error.message,
      );
    }

    return errorResponse(
      "Unable to update favorites.",
      500,
    );
  }
}
