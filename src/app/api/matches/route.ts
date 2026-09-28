import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/auth";

type UserDocument = {
  _id: mongoose.Types.ObjectId;

  firstName?: string;
  lastName?: string;
  gender?: string;

  dateOfBirth?: string | Date;

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

  height?: string;

  lifestyle?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;

  about?: string;

  photos?: unknown[];

  isEmailVerified?: boolean;
  isMobileVerified?: boolean;

  createdAt?: Date | string;
  updatedAt?: Date | string;

  partnerAgeMin?: string | number;
  partnerAgeMax?: string | number;
  partnerState?: string;
  partnerCity?: string;
  partnerReligion?: string;
  partnerEducation?: string;
  partnerProfession?: string;
  partnerMaritalStatus?: string;
  partnerLifestyle?: string;

  partnerPreferences?: {
    ageMin?: string | number;
    ageMax?: string | number;
    state?: string;
    city?: string;
    religion?: string;
    education?: string;
    profession?: string;
    maritalStatus?: string;
    lifestyle?: string;
  };

  preferences?: {
    ageMin?: string | number;
    ageMax?: string | number;
    state?: string;
    city?: string;
    religion?: string;
    education?: string;
    profession?: string;
    maritalStatus?: string;
    lifestyle?: string;
  };
};

/*
 * ============================================
 * Normalize Text
 * ============================================
 */

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/*
 * ============================================
 * Normalize Gender
 * ============================================
 *
 * Database may contain:
 *
 * male
 * Male
 * man
 *
 * female
 * Female
 * woman
 *
 * We convert everything to male/female.
 * ============================================
 */

function normalizeGender(
  gender: unknown,
): "male" | "female" | null {
  const value = normalize(gender);

  if (
    [
      "male",
      "man",
      "boy",
      "men",
      "m",
    ].includes(value)
  ) {
    return "male";
  }

  if (
    [
      "female",
      "woman",
      "girl",
      "women",
      "f",
    ].includes(value)
  ) {
    return "female";
  }

  return null;
}

/*
 * ============================================
 * Calculate Age
 * ============================================
 */

function calculateAge(
  dateOfBirth: string | Date | undefined,
): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    today.getMonth() -
    dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

/*
 * ============================================
 * Get Initials
 * ============================================
 */

function getInitials(
  firstName?: string,
  lastName?: string,
): string {
  const first =
    firstName?.trim()?.charAt(0) || "";

  const last =
    lastName?.trim()?.charAt(0) || "";

  return (
    `${first}${last}`.toUpperCase() || "U"
  );
}

/*
 * ============================================
 * Get First Photo
 * ============================================
 */

function getPhoto(photos: unknown) {
  if (
    !Array.isArray(photos) ||
    photos.length === 0
  ) {
    return null;
  }

  const firstPhoto = photos[0];

  if (typeof firstPhoto === "string") {
    return firstPhoto;
  }

  if (
    firstPhoto &&
    typeof firstPhoto === "object"
  ) {
    const photo =
      firstPhoto as Record<string, unknown>;

    if (typeof photo.url === "string") {
      return photo.url;
    }

    if (
      typeof photo.secure_url === "string"
    ) {
      return photo.secure_url;
    }

    if (
      typeof photo.src === "string"
    ) {
      return photo.src;
    }
  }

  return null;
}

/*
 * ============================================
 * Value Match
 * ============================================
 */

function valueMatches(
  candidateValue: unknown,
  preferredValue: unknown,
): boolean | null {
  if (
    preferredValue === undefined ||
    preferredValue === null ||
    String(preferredValue).trim() === ""
  ) {
    return null;
  }

  const candidate =
    normalize(candidateValue);

  if (!candidate) {
    return false;
  }

  if (Array.isArray(preferredValue)) {
    return preferredValue.some(
      (value) => {
        const preferred =
          normalize(value);

        if (!preferred) {
          return false;
        }

        return (
          candidate === preferred ||
          candidate.includes(preferred) ||
          preferred.includes(candidate)
        );
      },
    );
  }

  const preferred =
    normalize(preferredValue);

  if (!preferred) {
    return null;
  }

  return (
    candidate === preferred ||
    candidate.includes(preferred) ||
    preferred.includes(candidate)
  );
}

/*
 * ============================================
 * Get Partner Preferences
 * ============================================
 *
 * IMPORTANT:
 *
 * We don't simply do:
 *
 * partnerPreferences || preferences
 *
 * because partnerPreferences may exist but
 * contain empty fields.
 *
 * Instead every field gets its own fallback.
 * ============================================
 */

function getPartnerPreferences(
  user: UserDocument,
) {
  const partner =
    user.partnerPreferences || {};

  const preferences =
    user.preferences || {};

  return {
    ageMin:
      partner.ageMin ??
      preferences.ageMin ??
      user.partnerAgeMin,

    ageMax:
      partner.ageMax ??
      preferences.ageMax ??
      user.partnerAgeMax,

    state:
      partner.state ??
      preferences.state ??
      user.partnerState,

    city:
      partner.city ??
      preferences.city ??
      user.partnerCity,

    religion:
      partner.religion ??
      preferences.religion ??
      user.partnerReligion,

    education:
      partner.education ??
      preferences.education ??
      user.partnerEducation,

    profession:
      partner.profession ??
      preferences.profession ??
      user.partnerProfession,

    maritalStatus:
      partner.maritalStatus ??
      preferences.maritalStatus ??
      user.partnerMaritalStatus,

    lifestyle:
      partner.lifestyle ??
      preferences.lifestyle ??
      user.partnerLifestyle,
  };
}

/*
 * ============================================
 * LOCATION PRIORITY CHECK
 * ============================================
 *
 * State OR City must match.
 *
 * Example:
 *
 * Preference:
 * Haryana + Gurugram
 *
 * Haryana + Gurugram -> SHOW
 * Haryana + Delhi    -> SHOW
 * Punjab + Gurugram  -> SHOW
 * Punjab + Delhi     -> HIDE
 *
 * ============================================
 */

function matchesPreferredLocation(
  currentUser: UserDocument,
  candidate: UserDocument,
): boolean {
  const preferences =
    getPartnerPreferences(
      currentUser,
    );

  const preferredState =
    preferences.state;

  const preferredCity =
    preferences.city;

  const hasStatePreference =
    preferredState !== undefined &&
    preferredState !== null &&
    String(preferredState).trim() !== "";

  const hasCityPreference =
    preferredCity !== undefined &&
    preferredCity !== null &&
    String(preferredCity).trim() !== "";

  /*
   * No location preference
   */
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
        ) === true
      : false;

  const cityMatched =
    hasCityPreference
      ? valueMatches(
          candidate.city,
          preferredCity,
        ) === true
      : false;

  /*
   * State OR City
   */
  return (
    stateMatched ||
    cityMatched
  );
}

/*
 * ============================================
 * Compatibility Calculation
 * ============================================
 */

function calculateCompatibility(
  currentUser: UserDocument,
  candidate: UserDocument,
): number {
  const preferences =
    getPartnerPreferences(
      currentUser,
    );

  let totalWeight = 0;
  let matchedWeight = 0;

  const addScore = (
    weight: number,
    matched: boolean | null,
  ) => {
    if (matched === null) {
      return;
    }

    totalWeight += weight;

    if (matched) {
      matchedWeight += weight;
    }
  };

  /*
   * ============================================
   * Age - 30%
   * ============================================
   */

  const ageMin =
    preferences.ageMin;

  const ageMax =
    preferences.ageMax;

  if (
    ageMin !== undefined ||
    ageMax !== undefined
  ) {
    const candidateAge =
      calculateAge(
        candidate.dateOfBirth,
      );

    if (candidateAge !== null) {
      const min =
        ageMin !== undefined &&
        String(ageMin).trim() !== ""
          ? Number(ageMin)
          : 0;

      const max =
        ageMax !== undefined &&
        String(ageMax).trim() !== ""
          ? Number(ageMax)
          : 999;

      addScore(
        30,
        candidateAge >= min &&
          candidateAge <= max,
      );
    }
  }

  /*
   * ============================================
   * State - 15%
   * ============================================
   */

  addScore(
    15,
    valueMatches(
      candidate.state,
      preferences.state,
    ),
  );

  /*
   * ============================================
   * City - 10%
   * ============================================
   */

  addScore(
    10,
    valueMatches(
      candidate.city,
      preferences.city,
    ),
  );

  /*
   * ============================================
   * Religion - 15%
   * ============================================
   */

  addScore(
    15,
    valueMatches(
      candidate.religion,
      preferences.religion,
    ),
  );

  /*
   * ============================================
   * Education - 10%
   * ============================================
   */

  addScore(
    10,
    valueMatches(
      candidate.education,
      preferences.education,
    ),
  );

  /*
   * ============================================
   * Profession - 10%
   * ============================================
   */

  addScore(
    10,
    valueMatches(
      candidate.profession,
      preferences.profession,
    ),
  );

  /*
   * ============================================
   * Marital Status - 5%
   * ============================================
   */

  addScore(
    5,
    valueMatches(
      candidate.maritalStatus,
      preferences.maritalStatus,
    ),
  );

  /*
   * ============================================
   * Lifestyle - 5%
   * ============================================
   */

  addScore(
    5,
    valueMatches(
      candidate.lifestyle,
      preferences.lifestyle,
    ),
  );

  /*
   * ============================================
   * No usable preferences
   * ============================================
   */

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(
    (matchedWeight /
      totalWeight) *
      100,
  );
}

/*
 * ============================================
 * GET MATCHES
 * ============================================
 */

export async function GET() {
  try {
    /*
     * ============================================
     * 1. Get Authentication Cookie
     * ============================================
     */

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "matrimonial_session",
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to view matches.",
          users: [],
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ============================================
     * 2. Verify JWT
     * ============================================
     */

    const session =
      await verifyAuthToken(
        token,
      );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session has expired. Please login again.",
          users: [],
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ============================================
     * 3. User ID From Session
     * ============================================
     */

    const userId =
      session.userId;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid authenticated user ID.",
          users: [],
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ============================================
     * 4. Connect Database
     * ============================================
     */

    await connectDB();

    const db =
      mongoose.connection.db;

    if (!db) {
      throw new Error(
        "MongoDB database connection is not available",
      );
    }

    const usersCollection =
      db.collection<UserDocument>(
        "users",
      );

    /*
     * ============================================
     * 5. Get Current User
     * ============================================
     */

    const currentUser =
      (await usersCollection.findOne({
        _id:
          new mongoose.Types.ObjectId(
            userId,
          ),
      })) as UserDocument | null;

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authenticated user was not found.",
          users: [],
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ============================================
     * 6. Normalize Current Gender
     * ============================================
     */

    const currentGender =
      normalizeGender(
        currentUser.gender,
      );

    if (!currentGender) {
      return NextResponse.json({
        success: true,
        users: [],
        message:
          "Please complete your gender information to find matches.",
      });
    }

    /*
     * ============================================
     * 7. Opposite Gender
     * ============================================
     */

    const targetGender =
      currentGender === "male"
        ? "female"
        : "male";

    console.log(
      "====================================",
    );

    console.log(
      "MATCHES CURRENT USER:",
      currentUser.firstName,
      currentUser.lastName,
    );

    console.log(
      "MATCHES RAW GENDER:",
      currentUser.gender,
    );

    console.log(
      "MATCHES NORMALIZED GENDER:",
      currentGender,
    );

    console.log(
      "MATCHES TARGET GENDER:",
      targetGender,
    );

    console.log(
      "MATCHES PREFERENCE STATE:",
      getPartnerPreferences(
        currentUser,
      ).state,
    );

    console.log(
      "MATCHES PREFERENCE CITY:",
      getPartnerPreferences(
        currentUser,
      ).city,
    );

    console.log(
      "====================================",
    );

    /*
     * ============================================
     * 8. Get All Users
     * ============================================
     *
     * We intentionally get users and normalize
     * gender in JavaScript.
     *
     * This handles:
     *
     * male
     * Male
     * man
     *
     * female
     * Female
     * woman
     *
     * ============================================
     */

    const allCandidates =
      (await usersCollection
        .find({
          _id: {
            $ne:
              new mongoose.Types.ObjectId(
                userId,
              ),
          },
        })
        .sort({
          createdAt: -1,
        })
        .toArray()) as UserDocument[];

    /*
     * ============================================
     * 9. Opposite Gender Filter
     * ============================================
     */

    const candidates =
      allCandidates.filter(
        (candidate) =>
          normalizeGender(
            candidate.gender,
          ) === targetGender,
      );

    console.log(
      "MATCHES ALL USERS:",
      allCandidates.length,
    );

    console.log(
      "MATCHES OPPOSITE GENDER USERS:",
      candidates.length,
    );

    /*
     * ============================================
     * 10. Location Filter
     * ============================================
     */

    const locationMatchedCandidates =
      candidates.filter(
        (candidate) => {
          const matched =
            matchesPreferredLocation(
              currentUser,
              candidate,
            );

          console.log(
            "------------------------------------",
          );

          console.log(
            "CANDIDATE:",
            candidate.firstName,
            candidate.lastName,
          );

          console.log(
            "GENDER:",
            candidate.gender,
          );

          console.log(
            "NORMALIZED GENDER:",
            normalizeGender(
              candidate.gender,
            ),
          );

          console.log(
            "CANDIDATE STATE:",
            candidate.state,
          );

          console.log(
            "CANDIDATE CITY:",
            candidate.city,
          );

          console.log(
            "LOCATION MATCH:",
            matched,
          );

          return matched;
        },
      );

    console.log(
      "MATCHES AFTER LOCATION:",
      locationMatchedCandidates.length,
    );

    /*
     * ============================================
     * 11. Calculate Profiles
     * ============================================
     */

    const profiles =
      locationMatchedCandidates
        .map((user) => {
          const compatibility =
            calculateCompatibility(
              currentUser,
              user,
            );

          const firstName =
            user.firstName || "";

          const lastName =
            user.lastName || "";

          const age =
            calculateAge(
              user.dateOfBirth,
            );

          const name =
            `${firstName} ${lastName}`.trim() ||
            "Unnamed profile";

          const location = [
            user.city,
            user.state,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            id:
              user._id.toString(),

            name,

            age:
              age ?? 0,

            location:
              location ||
              "Location not added",

            profession:
              user.profession ||
              "Profession not added",

            education:
              user.education ||
              "Education not added",

            compatibility,

            initials:
              getInitials(
                firstName,
                lastName,
              ),

            photo:
              getPhoto(
                user.photos,
              ),

            verified:
              Boolean(
                user.isEmailVerified,
              ) ||
              Boolean(
                user.isMobileVerified,
              ),

            online: false,

            height:
              user.height ||
              "Not specified",

            maritalStatus:
              user.maritalStatus ||
              "Not specified",

            phone: "",

            newMatch:
              user.createdAt
                ? Date.now() -
                    new Date(
                      user.createdAt,
                    ).getTime() <
                  1000 *
                    60 *
                    60 *
                    24 *
                    7
                : false,

            about:
              user.about ||
              "Profile information has not been added yet.",

            createdAt:
              user.createdAt ||
              null,
          };
        })

        /*
         * ============================================
         * 12. Minimum 30% Compatibility
         * ============================================
         */

        .filter(
          (profile) =>
            profile.compatibility >= 30,
        )

        /*
         * ============================================
         * 13. Highest Match First
         * ============================================
         */

        .sort(
          (a, b) =>
            b.compatibility -
            a.compatibility,
        );

    console.log(
      "MATCHES FINAL 30%+:",
      profiles.length,
    );

    console.log(
      "FINAL PROFILES:",
      profiles.map(
        (profile) => ({
          name: profile.name,
          age: profile.age,
          location:
            profile.location,
          compatibility:
            profile.compatibility,
        }),
      ),
    );

    /*
     * ============================================
     * 14. Response
     * ============================================
     */

    return NextResponse.json({
      success: true,
      users: profiles,
    });
  } catch (error) {
    console.error(
      "GET /api/matches error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to calculate matches",
        users: [],
      },
      {
        status: 500,
      },
    );
  }
}