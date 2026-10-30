import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

function calculateAge(
  dateOfBirth: string | Date | undefined,
) {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() - dob.getFullYear();

  const monthDifference =
    today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

function getInitials(
  firstName?: string,
  lastName?: string,
) {
  const first =
    firstName?.trim()?.charAt(0) || "";

  const last =
    lastName?.trim()?.charAt(0) || "";

  return (
    `${first}${last}`.toUpperCase() || "U"
  );
}

function getPhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((photo) => {
      if (typeof photo === "string") {
        return photo;
      }

      if (
        photo &&
        typeof photo === "object" &&
        "url" in photo &&
        typeof photo.url === "string"
      ) {
        return photo.url;
      }

      return null;
    })
    .filter(
      (photo): photo is string =>
        Boolean(photo),
    );
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error(
        "MongoDB database connection is not available",
      );
    }

    const user = await db.collection("users").findOne(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        projection: {
          password: 0,
          email: 0,
        },
      },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile not found",
        },
        { status: 404 },
      );
    }

    const firstName =
      typeof user.firstName === "string"
        ? user.firstName
        : "";

    const lastName =
      typeof user.lastName === "string"
        ? user.lastName
        : "";

    const age = calculateAge(user.dateOfBirth);

    const verified =
      Boolean(user.isEmailVerified) ||
      Boolean(user.isMobileVerified);

    const profile = {
      id: user._id.toString(),

      firstName,
      lastName,

      name:
        `${firstName} ${lastName}`.trim() ||
        "Unnamed profile",

      age,
      dateOfBirth: user.dateOfBirth || null,

      gender: user.gender || "",
      profileFor: user.profileFor || "",

      mobile: user.mobile || "",
      isMobileVisible: Boolean(user.isMobileVisible),

      city: user.city || "",
      state: user.state || "",

      location: [
        user.city,
        user.state,
      ]
        .filter(Boolean)
        .join(", "),

        // About Yourself
      aboutYourself:
      typeof user.aboutYourself === "string"
        ? user.aboutYourself.trim()
        : typeof user.about === "string"
          ? user.about.trim()
          : "",
      // Basic details
      religion: user.religion || "",
      cast: user.cast || "",
      motherTongue: user.motherTongue || "",
      maritalStatus: user.maritalStatus || "",

      // Education and career
      education: user.education || "",
      college: user.college || "",
      profession: user.profession || "",
      company: user.company || "",
      income: user.income || "",

      // Family
      fatherOccupation: user.fatherOccupation || "",
      motherOccupation: user.motherOccupation || "",

      // Lifestyle
      diet: user.diet || "",
      smoking: user.smoking || "",
      drinking: user.drinking || "",

      // Partner preferences
      partnerAgeMin: user.partnerAgeMin || "",
      partnerAgeMax: user.partnerAgeMax || "",
      partnerState: user.partnerState || "",
      partnerCity: user.partnerCity || "",
      partnerReligion: user.partnerReligion || "",
      partnerCast: user.partnerCast || "",
      partnerEducation: user.partnerEducation || "",
      partnerProfession: user.partnerProfession || "",
      partnerMaritalStatus:
        user.partnerMaritalStatus || "",

      // Photos
      photos: getPhotos(user.photos),

      initials: getInitials(firstName, lastName),

      // Verification
      verified,

      isEmailVerified: Boolean(user.isEmailVerified),
      isMobileVerified: Boolean(user.isMobileVerified),
      isProfileComplete: Boolean(user.isProfileComplete),

      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
    };

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error(
      "GET /api/users/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
} 