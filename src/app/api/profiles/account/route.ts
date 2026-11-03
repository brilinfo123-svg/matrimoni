import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

/**
 * Delete only the current user's temporary registration images.
 * Never delete the shared registration-temp folder.
 */
async function deleteTemporaryPhotos(publicIds: string[]) {
  const validIds = [
    ...new Set(
      publicIds.filter(
        (id) =>
          typeof id === "string" &&
          id.startsWith("matrimonial/registration-temp/")
      )
    ),
  ];

  if (validIds.length === 0) return;

  await cloudinary.api.delete_resources(validIds, {
    resource_type: "image",
    type: "upload",
  });
}

/**
 * Delete all images inside this user's profile folder,
 * then remove the folder itself if it is empty.
 */
async function deleteUserProfileFolder(userId: string) {
  const folderPath = `matrimonial/profiles/${userId}`;

  console.log("Starting folder cleanup:", folderPath);

  let nextCursor: string | undefined;

  // Find all assets inside the exact user's Media Library folder.
  do {
    const result = await cloudinary.api.resources_by_asset_folder(
      folderPath,
      {
        max_results: 500,
        ...(nextCursor ? { next_cursor: nextCursor } : {}),
      }
    );

    const resources = result.resources || [];

    console.log("Assets found:", resources.length);

    // Delete images in batches of 100.
    for (let i = 0; i < resources.length; i += 100) {
      const batch = resources.slice(i, i + 100);

      // This folder is expected to contain images.
      const imageIds = batch
        .filter(
          (item: any) => item.resource_type === "image"
        )
        .map((item: any) => item.public_id)
        .filter(Boolean);

      if (imageIds.length > 0) {
        const deleteResult = await cloudinary.api.delete_resources(
          imageIds,
          {
            resource_type: "image",
            type: "upload",
            invalidate: true,
          }
        );

        console.log("Image deletion result:", deleteResult);

        const failed = Object.entries(
          deleteResult.deleted || {}
        ).filter(
          ([, status]) =>
            status !== "deleted" && status !== "not_found"
        );

        if (failed.length > 0) {
          throw new Error(
            `Cloudinary image deletion failed: ${JSON.stringify(failed)}`
          );
        }
      }
    }

    nextCursor = result.next_cursor || undefined;
  } while (nextCursor);

  // Check again before deleting the folder.
  const remaining = await cloudinary.api.resources_by_asset_folder(
    folderPath,
    { max_results: 1 }
  );

  if ((remaining.resources || []).length > 0) {
    throw new Error(
      `Folder is not empty. Remaining assets: ${
        remaining.resources.length
      }`
    );
  }

  // Delete only this user's empty folder.
  const folderResult = await cloudinary.api.delete_folder(folderPath);

  console.log("Folder deletion result:", folderResult);

  return folderResult;
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

// DELETE: Permanently delete account and Cloudinary photos
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

    // Get user before deleting the MongoDB document.
    const user = await User.findById(userId).select(
      "photos photoPublicIds"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    let cloudinaryDeleteFailed = false;

    // Delete temporary registration images using saved public IDs.
    try {
      const photoPublicIds = Array.isArray(user.photoPublicIds)
        ? user.photoPublicIds
        : [];

      await deleteTemporaryPhotos(photoPublicIds);
    } catch (error) {
      cloudinaryDeleteFailed = true;
      console.error(
        "Temporary Cloudinary photos deletion error:",
        error
      );
    }

    // Delete profile images and then the user's empty folder.
    try {
      await deleteUserProfileFolder(userId);
    } catch (error) {
      cloudinaryDeleteFailed = true;
      console.error(
        "Cloudinary profile folder deletion error:",
        error
      );
    }

    // Delete MongoDB account after attempting Cloudinary cleanup.
    await User.findByIdAndDelete(userId);

    const response = NextResponse.json({
      success: true,
      message: cloudinaryDeleteFailed
        ? "Account deleted, but some Cloudinary files or folders could not be removed."
        : "Account and associated photos deleted successfully.",
      cloudinaryDeleteFailed,
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