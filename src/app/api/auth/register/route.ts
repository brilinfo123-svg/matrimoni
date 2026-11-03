
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import {
  createAuthToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      profileFor,
      email,
      mobile,
      password,
      confirmPassword,

      firstName,
      lastName,
      gender,
      dateOfBirth,

      state,
      city,

      religion,
      cast,
      motherTongue,
      maritalStatus,

      education,
      college,
      profession,
      company,
      income,
      fatherOccupation,
      motherOccupation,
      aboutYourself,
      diet,
      smoking,
      drinking,

      partnerAgeMin,
      partnerAgeMax,

      partnerState,
      partnerCity,

      partnerReligion,
      partnerCast,
      partnerEducation,
      partnerProfession,
      partnerMaritalStatus,

      photos,
      photoPublicIds,
    } = body;

    if (!profileFor) {
      return NextResponse.json(
        { success: false, message: "Profile type is required." },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof mobile !== "string" ||
      !email.trim() ||
      !password ||
      !mobile.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, mobile and password are required.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    if (!/^\d{10}$/.test(normalizedMobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    const validPhotoEntries = Array.isArray(photos)
      ? photos
          .map((url: unknown, index: number) => ({
            url,
            publicId: Array.isArray(photoPublicIds)
              ? photoPublicIds[index]
              : "",
          }))
          .filter(
            (
              photo: { url: unknown; publicId: unknown }
            ): photo is { url: string; publicId: string } =>
              typeof photo.url === "string" &&
              photo.url.startsWith("https://res.cloudinary.com/") &&
              typeof photo.publicId === "string" &&
              photo.publicId.startsWith(
                "matrimonial/registration-temp/"
              )
          )
          .slice(0, 6)
      : [];

    await connectDB();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: normalizedMobile },
      ],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email already exists.",
          },
          { status: 409 }
        );
      }

      if (existingUser.mobile === normalizedMobile) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this mobile number already exists.",
          },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      profileFor,

      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,

      firstName,
      lastName,
      gender,
      dateOfBirth,

      state,
      city,

      religion,
      cast: typeof cast === "string" ? cast.trim() : "",
      motherTongue,
      maritalStatus,

      education,
      college,
      profession,
      company,
      income,

      fatherOccupation,
      motherOccupation,

      aboutYourself:
        typeof aboutYourself === "string"
          ? aboutYourself.trim().slice(0, 1000)
          : "",

      diet,
      smoking,
      drinking,

      partnerAgeMin,
      partnerAgeMax,

      partnerState,
      partnerCity,

      partnerReligion,
      partnerCast:
        typeof partnerCast === "string"
          ? partnerCast.trim()
          : "",
      partnerEducation,
      partnerProfession,
      partnerMaritalStatus,

      photos: validPhotoEntries.map((photo) => photo.url),
      photoPublicIds: validPhotoEntries.map(
        (photo) => photo.publicId
      ),

      isEmailVerified: false,
      isMobileVerified: false,
      isProfileComplete: true,
    });

    // Create login session immediately after registration.
    const token = await createAuthToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        redirectTo: "/matches",
      },
      { status: 201 }
    );

    // Same authentication cookie settings as login API.
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("REGISTER_API: Account created:", user.email);
    console.log("REGISTER_API: Auth cookie created.");

    return response;
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}