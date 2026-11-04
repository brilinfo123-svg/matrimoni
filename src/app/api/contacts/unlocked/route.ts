import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getContactUserId } from "@/lib/contact-auth";
import User from "@/models/User";

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

export async function GET() {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login.", profiles: [] },
        { status: 401 }
      );
    }

    await connectDB();

    const currentUser = await User.findById(userId)
      .select("unlockedProfiles")
      .lean();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found.", profiles: [] },
        { status: 404 }
      );
    }

    const ids = currentUser.unlockedProfiles || [];

    if (!ids.length) {
      return NextResponse.json({
        success: true,
        profiles: [],
      });
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
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U",
        verified: Boolean(user.isEmailVerified || user.isMobileVerified),
        isEmailVerified: Boolean(user.isEmailVerified),
        isMobileVerified: Boolean(user.isMobileVerified),
        profileComplete: Boolean(user.isProfileComplete),
        isMobileVisible: mobileVisible,
        mobile: mobileVisible ? String(user.mobile || "") : "",
        createdAt: user.createdAt || null,
        updatedAt: user.updatedAt || null,
        contactUnlocked: true,
      };
    });

    // Keep the order in which the user unlocked profiles.
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const orderedProfiles = ids
      .map((id) => profileMap.get(id.toString()))
      .filter((profile) => Boolean(profile));

    return NextResponse.json({
      success: true,
      profiles: orderedProfiles,
    });
  } catch (error) {
    console.error("UNLOCKED_PROFILES_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load unlocked profiles.", profiles: [] },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const profileId = body.profileId;

    if (
      typeof profileId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(profileId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid profile ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const currentUser = await User.findById(userId)
      .select("_id")
      .lean();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Sirf unlocked profile list se remove karega.
    // Credits aur free unlock count ko change nahi karega.
    await User.findByIdAndUpdate(userId, {
      $pull: {
        unlockedProfiles: profileId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile removed from unlocked list.",
      profileId,
    });
  } catch (error) {
    console.error("REMOVE_UNLOCKED_PROFILE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to remove unlocked profile.",
      },
      { status: 500 }
    );
  }
}