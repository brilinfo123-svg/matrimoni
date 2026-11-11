
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

const MAX_PHOTOS = 6;

const stringLimits: Record<string, number> = {
  profileFor: 50,
  firstName: 100,
  lastName: 100,
  gender: 20,
  dateOfBirth: 10,

  state: 100,
  city: 100,

  religion: 100,
  cast: 100,
  motherTongue: 100,
  maritalStatus: 100,

  education: 150,
  college: 200,
  profession: 150,
  company: 200,
  income: 100,

  aboutYourself: 500,

  diet: 100,
  smoking: 100,
  drinking: 100,

  partnerAgeMin: 3,
  partnerAgeMax: 3,
  partnerState: 100,
  partnerCity: 100,
  partnerReligion: 100,
  partnerCast: 100,
  partnerEducation: 150,
  partnerProfession: 150,
  partnerMaritalStatus: 100,
};

const editableFields = Object.keys(stringLimits);

function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizePhotos(
  value: unknown,
  currentPhotos: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return Array.isArray(currentPhotos)
      ? currentPhotos
          .filter(
            (photo): photo is string =>
              typeof photo === "string" &&
              photo.startsWith("https://"),
          )
          .slice(0, MAX_PHOTOS)
      : [];
  }

  const validPhotos = value.filter(
    (photo): photo is string =>
      typeof photo === "string" &&
      photo.startsWith("https://") &&
      photo.length <= 2000,
  );

  return [...new Set(validPhotos)].slice(0, MAX_PHOTOS);
}

function calculateAge(dateOfBirth: unknown): string {
  if (!dateOfBirth) return "";

  const dob = new Date(String(dateOfBirth));

  if (Number.isNaN(dob.getTime())) return "";

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (
      today.getMonth() === dob.getMonth() &&
      today.getDate() < dob.getDate()
    )
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "";
}

function calculateCompletion(user: Record<string, any>): number {
  const checks = [
    user.profileFor,
    user.firstName,
    user.lastName,
    user.gender,
    user.dateOfBirth,

    user.state,
    user.city,

    user.religion,
    user.cast,
    user.motherTongue,
    user.maritalStatus,

    user.education,
    user.college,
    user.profession,
    user.company,
    user.income,

    user.aboutYourself,

    user.diet,
    user.smoking,
    user.drinking,

    user.partnerAgeMin,
    user.partnerAgeMax,
    user.partnerState,
    user.partnerCity,
    user.partnerReligion,
    user.partnerCast,
    user.partnerEducation,
    user.partnerProfession,
    user.partnerMaritalStatus,

    Array.isArray(user.photos) && user.photos.length > 0,
  ];

  const completed = checks.filter((value) =>
    typeof value === "boolean" ? value : Boolean(value),
  ).length;

  return Math.round((completed / checks.length) * 100);
}

function buildProfile(user: Record<string, any>) {
  const completion = calculateCompletion(user);

  const photos = Array.isArray(user.photos)
    ? user.photos
    : [];

  return {
    id: user._id?.toString(),

    profileFor: user.profileFor || "",

    email: user.email || "",
    mobile: user.mobile || "",

    firstName: user.firstName || "",
    lastName: user.lastName || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth || "",
    age: calculateAge(user.dateOfBirth),

    state: user.state || "",
    city: user.city || "",

    religion: user.religion || "",
    cast: user.cast || "",
    motherTongue: user.motherTongue || "",
    maritalStatus: user.maritalStatus || "",

    education: user.education || "",
    college: user.college || "",
    profession: user.profession || "",
    company: user.company || "",
    income: user.income || "",

    fatherOccupation: user.fatherOccupation || "",
    motherOccupation: user.motherOccupation || "",

    aboutYourself: user.aboutYourself || "",

    diet: user.diet || "",
    smoking: user.smoking || "",
    drinking: user.drinking || "",

    partnerAgeMin:
      user.partnerAgeMin != null
        ? String(user.partnerAgeMin)
        : "",

    partnerAgeMax:
      user.partnerAgeMax != null
        ? String(user.partnerAgeMax)
        : "",

    partnerState: user.partnerState || "",
    partnerCity: user.partnerCity || "",
    partnerReligion: user.partnerReligion || "",
    partnerCast: user.partnerCast || "",
    partnerEducation: user.partnerEducation || "",
    partnerProfession: user.partnerProfession || "",
    partnerMaritalStatus: user.partnerMaritalStatus || "",

    photos,
    profileImage: photos[0] || null,

    isEmailVerified: Boolean(user.isEmailVerified),
    isMobileVerified: Boolean(user.isMobileVerified),
    isProfileComplete: Boolean(user.isProfileComplete),

    completion,
  };
}

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await verifyAuthToken(token);

  return session?.userId ?? null;
}

async function getUserCollection() {
  await connectDB();

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database connection is not available.");
  }

  return db.collection("users");
}

// Extract a Cloudinary public ID from its secure URL.
function getCloudinaryPublicId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "res.cloudinary.com") {
      return null;
    }

    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) return null;

    const afterUpload = parts.slice(uploadIndex + 1);

    // Remove transformations and version, if present.
    const versionIndex = afterUpload.findIndex((part) =>
      /^v\d+$/.test(part),
    );

    if (versionIndex === -1) return null;

    const publicIdParts = afterUpload.slice(versionIndex + 1);

    if (!publicIdParts.length) return null;

    const lastPart = publicIdParts[publicIdParts.length - 1];

    publicIdParts[publicIdParts.length - 1] =
      lastPart.replace(/\.[^.]+$/, "");

    return publicIdParts.join("/");
  } catch {
    return null;
  }
}

// Delete only Cloudinary images belonging to the authenticated user's folders.
async function deleteCloudinaryImage(
  publicId: string,
  allowedFolder: string,
): Promise<boolean> {
  if (!publicId.startsWith(allowedFolder)) {
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error(
      "CLOUDINARY_DELETE_ERROR:",
      publicId,
      error,
    );

    return false;
  }
}

// GET PROFILE
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const users = await getUserCollection();

    const user = await users.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: buildProfile(user),
    });
  } catch (error) {
    console.error("GET /api/profiles error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load profile.",
      },
      { status: 500 },
    );
  }
}

// UPDATE PROFILE
export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const users = await getUserCollection();
    const objectId = new mongoose.Types.ObjectId(userId);

    const currentUser = await users.findOne({
      _id: objectId,
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile not found.",
        },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};

    // Update editable text fields.
    for (const field of editableFields) {
      if (
        Object.prototype.hasOwnProperty.call(body, field)
      ) {
        updateData[field] = cleanString(
          body[field],
          stringLimits[field],
        );
      }
    }

    let removedPhotoUrls: string[] = [];
    let removedTempPublicIds: string[] = [];

    // Update gallery photos and preserve matching temp public IDs.
    if (
      Object.prototype.hasOwnProperty.call(body, "photos")
    ) {
      const oldPhotos = Array.isArray(currentUser.photos)
        ? currentUser.photos.filter(
            (photo: unknown): photo is string =>
              typeof photo === "string",
          )
        : [];

      const oldTempIds = Array.isArray(currentUser.photoPublicIds)
        ? currentUser.photoPublicIds
        : [];

      const newPhotos = normalizePhotos(
        body.photos,
        currentUser.photos,
      );

      removedPhotoUrls = oldPhotos.filter(
        (photo) => !newPhotos.includes(photo),
      );

      const retainedTempIds = newPhotos.map((photo) => {
        const oldIndex = oldPhotos.indexOf(photo);

        if (oldIndex === -1) return "";

        const publicId = oldTempIds[oldIndex];

        return typeof publicId === "string" ? publicId : "";
      });

      removedTempPublicIds = removedPhotoUrls
        .map((photo) => {
          const oldIndex = oldPhotos.indexOf(photo);
          const publicId = oldTempIds[oldIndex];

          return typeof publicId === "string" &&
            publicId.startsWith("matrimonial/registration-temp/")
            ? publicId
            : "";
        })
        .filter(Boolean);

      updateData.photos = newPhotos;
      updateData.photoPublicIds = retainedTempIds;
    }

    const updatedUser = {
      ...currentUser,
      ...updateData,
    };

    const completion = calculateCompletion(updatedUser);

    updateData.isProfileComplete = completion >= 80;
    updateData.updatedAt = new Date();

    const updateResult = await users.updateOne(
      { _id: objectId },
      {
        $set: updateData,
      },
    );

    if (!updateResult.matchedCount) {
      throw new Error("Unable to update profile.");
    }

    // Delete removed images after the database update succeeds.
    const allowedProfileFolder = `matrimonial/profiles/${userId}/`;

    const deletionResults = await Promise.all(
      removedPhotoUrls.map(async (photoUrl) => {
        const profilePublicId = getCloudinaryPublicId(photoUrl);

        let profileDeleted = true;

        if (
          profilePublicId &&
          profilePublicId.startsWith(allowedProfileFolder)
        ) {
          profileDeleted = await deleteCloudinaryImage(
            profilePublicId,
            allowedProfileFolder,
          );
        }

        return profileDeleted;
      }),
    );

    const tempDeletionResults = await Promise.all(
      removedTempPublicIds.map((publicId) =>
        deleteCloudinaryImage(
          publicId,
          "matrimonial/registration-temp/",
        ),
      ),
    );

    const cloudinaryDeleteFailed = [
      ...deletionResults,
      ...tempDeletionResults,
    ].some((result) => !result);

    const savedUser = await users.findOne({
      _id: objectId,
    });

    if (!savedUser) {
      throw new Error("Unable to load updated profile.");
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      cloudinaryDeleteFailed,
      profile: buildProfile(savedUser),
    });
  } catch (error) {
    console.error("PATCH /api/profiles error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile.",
      },
      { status: 500 },
    );
  }
}