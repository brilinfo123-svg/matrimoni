import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";

import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract the Cloudinary public_id from an uploaded image URL.
function getPublicId(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);

    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com"
    ) {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Find the version segment, e.g. v1234567890.
    const versionIndex = parts.findIndex(
      (part, index) =>
        index > uploadIndex && /^v\d+$/.test(part),
    );

    if (versionIndex === -1) return null;

    const publicIdParts = parts.slice(versionIndex + 1);

    if (publicIdParts.length === 0) return null;

    const lastPart = publicIdParts.length - 1;

    publicIdParts[lastPart] = publicIdParts[lastPart].replace(
      /\.[^/.]+$/,
      "",
    );

    return publicIdParts.join("/");
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the logged-in user.
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 },
      );
    }

    const auth = await verifyAuthToken(token);

    if (!auth?.userId) {
      return NextResponse.json(
        { message: "Invalid session." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const removedPhotos = body.removedPhotos;

    if (
      !Array.isArray(removedPhotos) ||
      removedPhotos.length > 6 ||
      !removedPhotos.every(
        (photo) => typeof photo === "string",
      )
    ) {
      return NextResponse.json(
        { message: "Invalid photo list." },
        { status: 400 },
      );
    }

    /*
     * IMPORTANT:
     * Set this to the exact user-specific folder used by
     * your /api/cloudinary/sign route.
     *
     * Example folder:
     * evermilan/profiles/USER_ID
     */
    const allowedFolder = `matrimonial/profiles/${auth.userId}`;

    const results = await Promise.all(
      removedPhotos.map(async (photoUrl: string) => {
        const publicId = getPublicId(photoUrl);

        // Never delete images outside this user's folder.
        if (
          !publicId ||
          !publicId.startsWith(`${allowedFolder}/`)
        ) {
          return {
            success: false,
            message: "Photo does not belong to this user.",
          };
        }

        const result = await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: "image",
            invalidate: true,
          },
        );

        return {
          success:
            result.result === "ok" ||
            result.result === "not found",
          result: result.result,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    return NextResponse.json(
      { message: "Unable to delete Cloudinary photos." },
      { status: 500 },
    );
  }
}