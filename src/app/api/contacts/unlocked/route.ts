
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getContactUserId } from "@/lib/contact-auth";
import User from "@/models/User";

// Allowed Expo Web origins.
// Production origins can be added using EXPO_WEB_ORIGINS.
function getAllowedOrigins() {
  return (process.env.EXPO_WEB_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";

  const allowedOrigins = getAllowedOrigins();

  // Allow localhost on any port for Expo development.
  let isLocalhost = false;

  try {
    const url = new URL(origin);

    isLocalhost =
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    isLocalhost = false;
  }

  const originAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    isLocalhost;

  const headers = new Headers();

  if (origin && originAllowed) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  headers.set("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );
  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

function corsResponse(response: NextResponse, request: Request) {
  const corsHeaders = getCorsHeaders(request);

  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

// Handle browser CORS preflight requests.
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

function calculateAge(dateOfBirth: string | Date | undefined) {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() &&
      today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

function getPhoto(photos: unknown): string | null {
  if (!Array.isArray(photos) || !photos.length) return null;

  const photo = photos[0];

  if (typeof photo === "string") return photo;

  if (photo && typeof photo === "object") {
    const item = photo as Record<string, unknown>;

    if (typeof item.url === "string") return item.url;
    if (typeof item.secure_url === "string") return item.secure_url;
    if (typeof item.src === "string") return item.src;
  }

  return null;
}

// GET: Load unlocked profiles.
export async function GET(request: Request) {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return corsResponse(
        NextResponse.json(
          { success: false, message: "Please login.", profiles: [] },
          { status: 401 }
        ),
        request
      );
    }

    await connectDB();

    const currentUser = await User.findById(userId)
      .select("unlockedProfiles")
      .lean();

    if (!currentUser) {
      return corsResponse(
        NextResponse.json(
          { success: false, message: "User not found.", profiles: [] },
          { status: 404 }
        ),
        request
      );
    }

    const ids = currentUser.unlockedProfiles || [];

    if (!ids.length) {
      return corsResponse(
        NextResponse.json({
          success: true,
          profiles: [],
        }),
        request
      );
    }

    const users = await User.find({
      _id: { $in: ids },
      isActive: true,
    })
      .select(
        "firstName lastName gender dateOfBirth state city religion cast motherTongue maritalStatus education profession company college profileFor photos isEmailVerified isMobileVerified isProfileComplete mobile isMobileVisible createdAt updatedAt"
      )
      .lean();

    const profiles = users.map((user) => {
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const mobileVisible = user.isMobileVisible === true;

      return {
        id: user._id.toString(),
        name: `${firstName} ${lastName}`.trim() || "Unnamed profile",
        age: calculateAge(user.dateOfBirth),
        location: [user.city, user.state].filter(Boolean).join(", "),
        city: user.city || "",
        state: user.state || "",
        profession: user.profession || "Profession not added",
        education: user.education || "Education not added",
        maritalStatus: user.maritalStatus || "Not specified",
        religion: user.religion || "",
        cast: user.cast || "",
        motherTongue: user.motherTongue || "",
        company: user.company || "",
        college: user.college || "",
        profileFor: user.profileFor || "",
        gender: user.gender || "",
        photo: getPhoto(user.photos),
        initials:
          `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U",
        profileComplete: Boolean(user.isProfileComplete),
        isMobileVisible: mobileVisible,
        mobile: mobileVisible ? String(user.mobile || "") : "",
        createdAt: user.createdAt || null,
        updatedAt: user.updatedAt || null,
        contactUnlocked: true,
      };
    });

    // Preserve the order in which profiles were unlocked.
    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile])
    );

    const orderedProfiles = ids
      .map((id) => profileMap.get(id.toString()))
      .filter((profile) => Boolean(profile));

    return corsResponse(
      NextResponse.json({
        success: true,
        profiles: orderedProfiles,
      }),
      request
    );
  } catch (error) {
    console.error("UNLOCKED_PROFILES_ERROR:", error);

    return corsResponse(
      NextResponse.json(
        {
          success: false,
          message: "Unable to load unlocked profiles.",
          profiles: [],
        },
        { status: 500 }
      ),
      request
    );
  }
}

// DELETE: Remove a profile from the unlocked list.
// No credits or free unlock counts are refunded.
export async function DELETE(request: Request) {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return corsResponse(
        NextResponse.json(
          { success: false, message: "Please login." },
          { status: 401 }
        ),
        request
      );
    }

    const body = await request.json();
    const profileId = body.profileId;

    if (
      typeof profileId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(profileId)
    ) {
      return corsResponse(
        NextResponse.json(
          { success: false, message: "Invalid profile ID." },
          { status: 400 }
        ),
        request
      );
    }

    await connectDB();

    const currentUser = await User.findById(userId)
      .select("_id")
      .lean();

    if (!currentUser) {
      return corsResponse(
        NextResponse.json(
          { success: false, message: "User not found." },
          { status: 404 }
        ),
        request
      );
    }

    await User.findByIdAndUpdate(userId, {
      $pull: {
        unlockedProfiles: profileId,
      },
    });

    return corsResponse(
      NextResponse.json({
        success: true,
        message: "Profile removed from unlocked list.",
        profileId,
      }),
      request
    );
  } catch (error) {
    console.error("REMOVE_UNLOCKED_PROFILE_ERROR:", error);

    return corsResponse(
      NextResponse.json(
        {
          success: false,
          message: "Unable to remove unlocked profile.",
        },
        { status: 500 }
      ),
      request
    );
  }
}