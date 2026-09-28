import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

type UserDocument = {
  _id: mongoose.Types.ObjectId;

  profileFor?: string;

  email?: string;
  mobile?: string;

  firstName?: string;
  lastName?: string;

  gender?: string;
  dateOfBirth?: string;

  state?: string;
  city?: string;

  religion?: string;
  motherTongue?: string;
  maritalStatus?: string;

  education?: string;
  college?: string;
  profession?: string;
  company?: string;
  income?: string;

  familyType?: string;
  familyValues?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;

  lifestyle?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;

  partnerAgeMin?: string;
  partnerAgeMax?: string;
  partnerState?: string;
  partnerCity?: string;
  partnerReligion?: string;
  partnerEducation?: string;
  partnerProfession?: string;
  partnerMaritalStatus?: string;
  partnerLifestyle?: string;

  photos?: string[];

  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isProfileComplete?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

function cleanValue(value: unknown): string {
  return String(value ?? "").trim();
}

function valueMatches(
  candidateValue: unknown,
  preferredValue: unknown,
): boolean {
  const candidate = cleanValue(candidateValue).toLowerCase();
  const preferred = cleanValue(preferredValue).toLowerCase();

  if (!candidate || !preferred) {
    return false;
  }

  return (
    candidate === preferred ||
    candidate.includes(preferred) ||
    preferred.includes(candidate)
  );
}

function calculateAge(dateOfBirth?: string): number {
  if (!dateOfBirth) {
    return 0;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function calculateProfileCompletion(
  user: UserDocument,
): number {
  const fields = [
    user.firstName,
    user.lastName,
    user.gender,
    user.dateOfBirth,
    user.state,
    user.city,
    user.religion,
    user.motherTongue,
    user.maritalStatus,

    user.education,
    user.profession,
    user.company,

    user.familyValues,
    user.lifestyle,
    user.diet,
    user.smoking,
    user.drinking,

    user.partnerAgeMin,
    user.partnerAgeMax,
    user.partnerState,
    user.partnerCity,
    user.partnerReligion,
    user.partnerEducation,
    user.partnerProfession,
    user.partnerMaritalStatus,
    user.partnerLifestyle,

    user.photos && user.photos.length > 0
      ? "photos"
      : "",
  ];

  const completed = fields.filter(
    (field) => cleanValue(field) !== "",
  ).length;

  return Math.round(
    (completed / fields.length) * 100,
  );
}

function matchesPreferredLocation(
  currentUser: UserDocument,
  candidate: UserDocument,
) {
  const preferredState =
    currentUser.partnerState;

  const preferredCity =
    currentUser.partnerCity;

  const hasStatePreference =
    cleanValue(preferredState) !== "";

  const hasCityPreference =
    cleanValue(preferredCity) !== "";

  // No location preference
  if (
    !hasStatePreference &&
    !hasCityPreference
  ) {
    return true;
  }

  const stateMatched =
    hasStatePreference
      ? valueMatches(
          candidate.state,
          preferredState,
        )
      : false;

  const cityMatched =
    hasCityPreference
      ? valueMatches(
          candidate.city,
          preferredCity,
        )
      : false;

  // IMPORTANT:
  // Either state OR city can match.
  return stateMatched || cityMatched;
}

function calculateCompatibility(
  currentUser: UserDocument,
  candidate: UserDocument,
): number {
  let score = 0;

  /*
   * Age - 30%
   */
  const candidateAge = calculateAge(
    candidate.dateOfBirth,
  );

  const minAge = Number(
    currentUser.partnerAgeMin,
  );

  const maxAge = Number(
    currentUser.partnerAgeMax,
  );

  if (
    candidateAge > 0 &&
    Number.isFinite(minAge) &&
    Number.isFinite(maxAge) &&
    candidateAge >= minAge &&
    candidateAge <= maxAge
  ) {
    score += 30;
  }

  /*
   * State - 15%
   */
  if (
    valueMatches(
      candidate.state,
      currentUser.partnerState,
    )
  ) {
    score += 15;
  }

  /*
   * City - 10%
   */
  if (
    valueMatches(
      candidate.city,
      currentUser.partnerCity,
    )
  ) {
    score += 10;
  }

  /*
   * Religion - 15%
   */
  if (
    valueMatches(
      candidate.religion,
      currentUser.partnerReligion,
    )
  ) {
    score += 15;
  }

  /*
   * Education - 10%
   */
  if (
    valueMatches(
      candidate.education,
      currentUser.partnerEducation,
    )
  ) {
    score += 10;
  }

  /*
   * Profession - 10%
   */
  if (
    valueMatches(
      candidate.profession,
      currentUser.partnerProfession,
    )
  ) {
    score += 10;
  }

  /*
   * Marital status - 5%
   */
  if (
    valueMatches(
      candidate.maritalStatus,
      currentUser.partnerMaritalStatus,
    )
  ) {
    score += 5;
  }

  /*
   * Lifestyle - 5%
   */
  if (
    valueMatches(
      candidate.lifestyle,
      currentUser.partnerLifestyle,
    )
  ) {
    score += 5;
  }

  return score;
}

function getInitials(
  firstName?: string,
  lastName?: string,
) {
  const first = cleanValue(firstName);
  const last = cleanValue(lastName);

  if (!first && !last) {
    return "U";
  }

  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export async function GET() {
  try {
    /*
     * ===============================
     * AUTH
     * ===============================
     */

    const cookieStore = await cookies();

    const token =
      cookieStore.get(
        AUTH_COOKIE_NAME,
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const session =
      await verifyAuthToken(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 },
      );
    }

    /*
     * ===============================
     * DATABASE
     * ===============================
     */

    await connectDB();

    const currentUser =
      (await User.findById(
        session.userId,
      ).lean()) as UserDocument | null;

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    /*
     * ===============================
     * PROFILE
     * ===============================
     */

    const completion =
      calculateProfileCompletion(
        currentUser,
      );

    const firstName =
      cleanValue(currentUser.firstName);

    const lastName =
      cleanValue(currentUser.lastName);

    const fullName =
      `${firstName} ${lastName}`.trim();

    /*
     * ===============================
     * RECOMMENDED PROFILES
     * ===============================
     */

    let recommendedProfiles: any[] = [];

    const currentGender =
      cleanValue(currentUser.gender)
        .toLowerCase();

    let targetGender = "";

    if (currentGender === "male") {
      targetGender = "female";
    } else if (currentGender === "female") {
      targetGender = "male";
    }

    if (targetGender) {
      const candidates =
        (await User.find({
          _id: {
            $ne: currentUser._id,
          },
          gender: {
            $regex: `^${targetGender}$`,
            $options: "i",
          },
        })
          .sort({
            createdAt: -1,
          })
          .limit(50)
          .lean()) as UserDocument[];

      recommendedProfiles =
        candidates
          .filter((candidate) =>
            matchesPreferredLocation(
              currentUser,
              candidate,
            ),
          )
          .map((candidate) => {
            const compatibility =
              calculateCompatibility(
                currentUser,
                candidate,
              );

            return {
              id: candidate._id.toString(),

              name:
                `${cleanValue(candidate.firstName)} ${cleanValue(candidate.lastName)}`.trim(),

              age: calculateAge(
                candidate.dateOfBirth,
              ),

              city:
                cleanValue(candidate.city) ||
                "Location not added",

              state:
                cleanValue(candidate.state),

              profession:
                cleanValue(candidate.profession) ||
                "Profession not added",

              education:
                cleanValue(candidate.education),

              compatibility,

              initials: getInitials(
                candidate.firstName,
                candidate.lastName,
              ),

              verified:
                Boolean(
                  candidate.isEmailVerified &&
                    candidate.isMobileVerified,
                ),

              online: false,

              photo:
                candidate.photos &&
                candidate.photos.length > 0
                  ? candidate.photos[0]
                  : "",

              maritalStatus:
                cleanValue(
                  candidate.maritalStatus,
                ),
            };
          })
          .filter(
            (profile) =>
              profile.compatibility >= 30,
          )
          .sort(
            (a, b) =>
              b.compatibility -
              a.compatibility,
          )
          .slice(0, 4);
    }

    /*
     * ===============================
     * DASHBOARD RESPONSE
     * ===============================
     */

    return NextResponse.json({
      success: true,

      user: {
        id: currentUser._id.toString(),

        firstName:
          currentUser.firstName || "",

        lastName:
          currentUser.lastName || "",

        name:
          fullName || "User",

        email:
          currentUser.email || "",

        mobile:
          currentUser.mobile || "",

        initials: getInitials(
          currentUser.firstName,
          currentUser.lastName,
        ),

        age: calculateAge(
          currentUser.dateOfBirth,
        ),

        gender:
          currentUser.gender || "",

        city:
          currentUser.city || "",

        state:
          currentUser.state || "",

        religion:
          currentUser.religion || "",

        motherTongue:
          currentUser.motherTongue || "",

        maritalStatus:
          currentUser.maritalStatus || "",

        education:
          currentUser.education || "",

        profession:
          currentUser.profession || "",

        company:
          currentUser.company || "",

        income:
          currentUser.income || "",

        profileFor:
          currentUser.profileFor || "",

        photos:
          currentUser.photos || [],

        isEmailVerified:
          Boolean(
            currentUser.isEmailVerified,
          ),

        isMobileVerified:
          Boolean(
            currentUser.isMobileVerified,
          ),

        isProfileComplete:
          Boolean(
            currentUser.isProfileComplete,
          ),

        completion,
      },

      stats: {
        newInterests: 0,
        shortlisted: 0,
        unreadMessages: 0,
        profileViews: 0,
      },

      recommendedProfiles,

      recentMessages: [],

      insights: {
        profileViews: 0,
        growth: 0,
        bars: [
          {
            day: "Mon",
            value: 0,
          },
          {
            day: "Tue",
            value: 0,
          },
          {
            day: "Wed",
            value: 0,
          },
          {
            day: "Thu",
            value: 0,
          },
          {
            day: "Fri",
            value: 0,
          },
          {
            day: "Sat",
            value: 0,
          },
          {
            day: "Sun",
            value: 0,
          },
        ],
      },
    });
  } catch (error) {
    console.error(
      "DASHBOARD_API_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while loading dashboard.",
      },
      { status: 500 },
    );
  }
}