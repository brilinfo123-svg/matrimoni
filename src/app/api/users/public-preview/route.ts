
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

function calculateAge(dateOfBirth: unknown): number | null {
  if (!dateOfBirth) return null;

  const dob = new Date(String(dateOfBirth));

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

  return age >= 18 ? age : null;
}

function getPhoto(photos: unknown): string | null {
  if (!Array.isArray(photos)) return null;

  const first = photos.find(
    (photo) => typeof photo === "string" && photo.trim()
  );

  return typeof first === "string" ? first : null;
}

export async function GET() {
  try {
    await connectDB();

    const collection =
      mongoose.connection.collection("users");

    const users = await collection
      .find(
        {
          isProfileComplete: true,
          gender: { $exists: true, $ne: "" },
        },
        {
          projection: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            gender: 1,
            dateOfBirth: 1,
            city: 1,
            state: 1,
            profession: 1,
            photos: 1,
            isProfileComplete: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    const profiles = users.map((user) => ({
      id: user._id.toString(),
      name:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "EverMilan Member",
      age: calculateAge(user.dateOfBirth),
      city: user.city || "",
      state: user.state || "",
      location: [user.city, user.state].filter(Boolean).join(", "),
      profession: user.profession || "",
      photo: getPhoto(user.photos),
      gender: user.gender || "",
    }));

    return NextResponse.json(
      { success: true, users: profiles },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("PUBLIC_PROFILE_PREVIEW_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load profile previews.",
        users: [],
      },
      { status: 500 }
    );
  }
}
