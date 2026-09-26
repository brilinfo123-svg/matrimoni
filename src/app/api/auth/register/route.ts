import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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
      motherTongue,
      maritalStatus,

      education,
      college,
      profession,
      company,
      income,

      familyType,
      familyValues,
      fatherOccupation,
      motherOccupation,
      siblings,

      lifestyle,
      diet,
      smoking,
      drinking,

      partnerAgeMin,
      partnerAgeMax,

      partnerState,
      partnerCity,

      partnerReligion,
      partnerEducation,
      partnerProfession,
      partnerMaritalStatus,
      partnerLifestyle,

      photos,
    } = body;

    if (!profileFor) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile type is required.",
        },
        { status: 400 },
      );
    }

    if (!email || !password || !mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, mobile and password are required.",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 8 characters.",
        },
        { status: 400 },
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: mobile.trim() },
      ],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email already exists.",
          },
          { status: 409 },
        );
      }

      if (existingUser.mobile === mobile.trim()) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this mobile number already exists.",
          },
          { status: 409 },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      profileFor,

      email: normalizedEmail,
      mobile: mobile.trim(),
      password: hashedPassword,

      firstName,
      lastName,
      gender,
      dateOfBirth,

      state,
      city,

      religion,
      motherTongue,
      maritalStatus,

      education,
      college,
      profession,
      company,
      income,

      familyType,
      familyValues,
      fatherOccupation,
      motherOccupation,
      siblings,

      lifestyle,
      diet,
      smoking,
      drinking,

      partnerAgeMin,
      partnerAgeMax,

      partnerState,
      partnerCity,

      partnerReligion,
      partnerEducation,
      partnerProfession,
      partnerMaritalStatus,
      partnerLifestyle,

      photos: Array.isArray(photos) ? photos : [],

      isEmailVerified: false,
      isMobileVerified: false,
      isProfileComplete: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account.",
      },
      { status: 500 },
    );
  }
}