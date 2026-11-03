import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --------------------------------------------------
// CLOUDINARY CONFIGURATION
// --------------------------------------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------------------------------------
// AUTHENTICATION HELPERS
// --------------------------------------------------

async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

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

// --------------------------------------------------
// CLOUDINARY HELPERS
// --------------------------------------------------

function checkCloudinaryCredentials() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials are missing.");
  }
}

function getCloudinaryPublicId(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      !cloudName
    ) {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);

    if (
      parts[0] !== cloudName ||
      parts[1] !== "image" ||
      parts[2] !== "upload"
    ) {
      return null;
    }

    const uploadIndex = parts.indexOf("upload");

    const versionIndex = parts.findIndex(
      (part, index) =>
        index > uploadIndex && /^v\d+$/.test(part)
    );

    if (versionIndex === -1) return null;

    const publicIdParts = parts.slice(versionIndex + 1);

    if (!publicIdParts.length) return null;

    const lastIndex = publicIdParts.length - 1;

    publicIdParts[lastIndex] = publicIdParts[lastIndex].replace(
      /\.[^/.]+$/,
      ""
    );

    return publicIdParts.join("/") || null;
  } catch {
    return null;
  }
}

// Only allow the current user's profile folders
// and the shared registration-temp folder.
//
// IMPORTANT:
// registration-temp is shared. We only delete IDs
// found in the current user's MongoDB photos array.

function isAllowedPublicId(publicId: string, userId: string) {
  const allowedPrefixes = [
    `matrimonial/profiles/${userId}/`,
    `evermilan/profiles/${userId}/`,
    "matrimonial/registration-temp/",
  ];

  return allowedPrefixes.some((prefix) =>
    publicId.startsWith(prefix)
  );
}

function isCloudinaryNotFound(error: any): boolean {
  const statusCode =
    error?.http_code ?? error?.error?.http_code;

  const message =
    error?.message ?? error?.error?.message ?? "";

  return (
    statusCode === 404 ||
    message.includes("Folder doesn't exist")
  );
}

// --------------------------------------------------
// DELETE SAVED USER PHOTOS
// --------------------------------------------------

async function deleteCloudinaryPhotos(
  photos: unknown[],
  userId: string
): Promise<number> {
  const uniquePhotos = [
    ...new Set(
      photos.filter(
        (photo): photo is string =>
          typeof photo === "string" &&
          photo.trim().length > 0
      )
    ),
  ];

  if (uniquePhotos.length === 0) {
    console.log("No saved Cloudinary photos found.");
    return 0;
  }

  checkCloudinaryCredentials();

  const results = await Promise.all(
    uniquePhotos.map(async (photoUrl) => {
      const publicId = getCloudinaryPublicId(photoUrl);

      if (
        !publicId ||
        !isAllowedPublicId(publicId, userId)
      ) {
        return {
          success: false,
          message: "Invalid or unsupported Cloudinary photo URL.",
          photoUrl,
        };
      }

      const result = await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
          type: "upload",
          invalidate: true,
        }
      );

      return {
        success:
          result.result === "ok" ||
          result.result === "not found",
        result: result.result,
        publicId,
      };
    })
  );

  const failed = results.filter(
    (result) => !result.success
  );

  if (failed.length > 0) {
    console.error(
      "Cloudinary photo deletion failures:",
      failed
    );

    throw new Error(
      `${failed.length} photo(s) could not be deleted from Cloudinary.`
    );
  }

  console.log(
    `Deleted ${results.length} saved Cloudinary photo(s).`
  );

  return results.length;
}

// --------------------------------------------------
// DELETE USER-SPECIFIC PROFILE FOLDER
// --------------------------------------------------

async function deleteUserCloudinaryFolder(userId: string) {
  checkCloudinaryCredentials();

  const folderPath = `matrimonial/profiles/${userId}`;

  console.log(
    "Starting Cloudinary folder cleanup:",
    folderPath
  );

  try {
    let nextCursor: string | undefined;

    // Find and delete all remaining images in this folder.
    do {
      const result =
        await cloudinary.api.resources_by_asset_folder(
          folderPath,
          {
            max_results: 500,
            ...(nextCursor
              ? { next_cursor: nextCursor }
              : {}),
          }
        );

      const resources = result.resources || [];

      const imageIds = resources
        .filter(
          (item: any) =>
            item.resource_type === "image" &&
            item.type === "upload"
        )
        .map((item: any) => item.public_id)
        .filter(Boolean);

      // Cloudinary supports deleting up to 100 IDs per batch.
      for (let i = 0; i < imageIds.length; i += 100) {
        const batch = imageIds.slice(i, i + 100);

        const deleteResult =
          await cloudinary.api.delete_resources(
            batch,
            {
              resource_type: "image",
              type: "upload",
              invalidate: true,
            }
          );

        const failed = Object.entries(
          deleteResult.deleted || {}
        ).filter(
          ([, status]) =>
            status !== "deleted" &&
            status !== "not_found"
        );

        if (failed.length > 0) {
          throw new Error(
            "Cloudinary profile image deletion failed: " +
              JSON.stringify(failed)
          );
        }
      }

      nextCursor = result.next_cursor || undefined;
    } while (nextCursor);

    // Verify that no assets remain.
    const remaining =
      await cloudinary.api.resources_by_asset_folder(
        folderPath,
        {
          max_results: 1,
        }
      );

    if ((remaining.resources || []).length > 0) {
      throw new Error(
        `Cloudinary folder still contains assets: ${folderPath}`
      );
    }

    // Delete the actual user-specific folder.
    await cloudinary.api.delete_folder(folderPath);

    console.log(
      "Cloudinary user folder deleted successfully:",
      folderPath
    );

    return {
      deleted: true,
      alreadyAbsent: false,
    };
  } catch (error: any) {
    // If the folder does not exist, there is nothing
    // left to clean up. Continue with MongoDB deletion.
    if (isCloudinaryNotFound(error)) {
      console.log(
        "Cloudinary profile folder already absent:",
        folderPath
      );

      return {
        deleted: false,
        alreadyAbsent: true,
      };
    }

    console.error(
      "Cloudinary folder cleanup failed:",
      error
    );

    throw error;
  }
}

// --------------------------------------------------
// POST: ACTIVATE / DEACTIVATE ACCOUNT
// --------------------------------------------------

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    let body: { action?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    if (
      body.action !== "deactivate" &&
      body.action !== "activate"
    ) {
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
      throw new Error(
        "Database connection is not available."
      );
    }

    const isActive = body.action === "activate";

    const result = await db.collection("users").updateOne(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      {
        $set: {
          isActive,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Account activated successfully."
        : "Account deactivated successfully.",
    });
  } catch (error) {
    console.error(
      "POST /api/profileSetting/account error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update account status.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// DELETE: ACCOUNT + CLOUDINARY PHOTOS + USER FOLDER
// --------------------------------------------------

export async function DELETE() {
  try {
    // 1. Authenticate user.
    const userId = await getAuthenticatedUserId();

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // 2. Connect MongoDB.
    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error(
        "Database connection is not available."
      );
    }

    const usersCollection = db.collection("users");

    // 3. Get current user's photos.
    const user = await usersCollection.findOne(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      {
        projection: {
          photos: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found.",
        },
        { status: 404 }
      );
    }

    const photos = Array.isArray(user.photos)
      ? user.photos
      : [];

    // 4. Delete saved photos.
    // This includes registration-temp photos if their URLs
    // are saved in this user's MongoDB photos array.
    const deletedPhotoCount =
      await deleteCloudinaryPhotos(photos, userId);

    // 5. Delete the user's profile folder if it exists.
    // Missing folder does not stop account deletion.
    const folderResult =
      await deleteUserCloudinaryFolder(userId);

    // 6. Delete user from MongoDB only after cleanup succeeds.
    const deleteResult = await usersCollection.deleteOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudinary cleanup completed, but the account could not be deleted.",
        },
        { status: 500 }
      );
    }

    console.log(
      "User account deleted successfully:",
      userId
    );

    // 7. Clear login session after successful deletion.
    const response = NextResponse.json({
      success: true,
      message:
        "Account and profile photos deleted successfully.",
      deletedPhotoCount,
      profileFolderDeleted: folderResult.deleted,
      profileFolderAlreadyAbsent: folderResult.alreadyAbsent,
    });

    return clearSessionCookie(response);
  } catch (error) {
    console.error(
      "DELETE /api/profileSetting/account error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete account and profile photos.",
      },
      { status: 500 }
    );
  }
}