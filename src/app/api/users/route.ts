import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/auth";

/*
 * ============================================
 * Calculate Age
 * ============================================
 */

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
 * Normalize Text
 * ============================================
 */

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/*
 * ============================================
 * Normalize Gender
 * ============================================
 *
 * Supports existing database values:
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

function normalizeGender(
  gender: unknown,
): "male" | "female" | null {
  const value = normalize(gender);

  if (
    [
      "male",
      "man",
      "men",
      "boy",
      "m",
    ].includes(value)
  ) {
    return "male";
  }

  if (
    [
      "female",
      "woman",
      "women",
      "girl",
      "f",
    ].includes(value)
  ) {
    return "female";
  }

  return null;
}

/*
 * ============================================
 * Get Initials
 * ============================================
 */

function getInitials(
  firstName?: string,
  lastName?: string,
) {
  const first =
    firstName?.trim().charAt(0) || "";

  const last =
    lastName?.trim().charAt(0) || "";

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

  /*
   * Photo stored directly as string
   */
  if (typeof firstPhoto === "string") {
    return firstPhoto;
  }

  /*
   * Photo stored as object
   */
  if (
    firstPhoto &&
    typeof firstPhoto === "object"
  ) {
    const photo =
      firstPhoto as Record<
        string,
        unknown
      >;

    if (
      typeof photo.url === "string"
    ) {
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
 * Location Match Score
 * ============================================
 *
 * Priority:
 *
 * State + City = 3
 * City only    = 2
 * State only   = 1
 * Neither      = 0
 *
 * Only profiles with score > 0 are shown.
 *
 * ============================================
 */

function getLocationScore(
  currentUser: {
    state?: string;
    city?: string;
  },
  candidate: {
    state?: string;
    city?: string;
  },
) {
  const currentState =
    normalize(currentUser.state);

  const currentCity =
    normalize(currentUser.city);

  const candidateState =
    normalize(candidate.state);

  const candidateCity =
    normalize(candidate.city);

  const stateMatched =
    Boolean(currentState) &&
    Boolean(candidateState) &&
    currentState === candidateState;

  const cityMatched =
    Boolean(currentCity) &&
    Boolean(candidateCity) &&
    currentCity === candidateCity;

  if (
    stateMatched &&
    cityMatched
  ) {
    return 3;
  }

  if (cityMatched) {
    return 2;
  }

  if (stateMatched) {
    return 1;
  }

  return 0;
}

/*
 * ============================================
 * GET DISCOVER USERS
 * ============================================
 */

export async function GET() {
  try {
    /*
     * ============================================
     * 1. Authentication
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
            "Please login to discover profiles.",
          users: [],
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ============================================
     * 2. Verify Session
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
     * 3. Validate User ID
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
     * 4. Connect MongoDB
     * ============================================
     */

    await connectDB();

    const usersCollection =
      mongoose.connection.collection(
        "users",
      );

    /*
     * ============================================
     * 5. Get Logged-in User
     * ============================================
     */

    const currentUser =
      await usersCollection.findOne(
        {
          _id:
            new mongoose.Types.ObjectId(
              userId,
            ),
        },
        {
          projection: {
            password: 0,
          },
        },
      );

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
          "Please complete your gender information to discover profiles.",
      });
    }

    /*
     * ============================================
     * 7. Determine Opposite Gender
     * ============================================
     */

    const targetGender =
      currentGender === "male"
        ? "female"
        : "male";

    console.log(
      "======================================",
    );

    console.log(
      "DISCOVER CURRENT USER:",
      currentUser.firstName,
      currentUser.lastName,
    );

    console.log(
      "DISCOVER CURRENT GENDER:",
      currentUser.gender,
    );

    console.log(
      "DISCOVER NORMALIZED GENDER:",
      currentGender,
    );

    console.log(
      "DISCOVER TARGET GENDER:",
      targetGender,
    );

    console.log(
      "DISCOVER USER STATE:",
      currentUser.state,
    );

    console.log(
      "DISCOVER USER CITY:",
      currentUser.city,
    );

    console.log(
      "======================================",
    );

    /*
     * ============================================
     * 8. Get All Other Users
     * ============================================
     */

    const allUsers =
      await usersCollection
        .find(
          {
            _id: {
              $ne:
                new mongoose.Types.ObjectId(
                  userId,
                ),
            },
          },
          {
            projection: {
              password: 0,
              email: 0,
              // mobile: 0,
            },
          },
        )
        .sort({
          createdAt: -1,
        })
        .toArray();

    /*
     * ============================================
     * 9. Opposite Gender Filter
     * ============================================
     *
     * Male -> Female/Woman
     * Female -> Male/Man
     * ============================================
     */

    const oppositeGenderUsers =
      allUsers.filter(
        (user) =>
          normalizeGender(
            user.gender,
          ) === targetGender,
      );

    console.log(
      "DISCOVER TOTAL USERS:",
      allUsers.length,
    );

    console.log(
      "DISCOVER OPPOSITE GENDER:",
      oppositeGenderUsers.length,
    );

    /*
     * ============================================
     * 10. Location Filter
     * ============================================
     *
     * IMPORTANT:
     *
     * State OR City must match.
     *
     * Example:
     *
     * Current:
     * Haryana + Gurugram
     *
     * Candidate:
     *
     * Haryana + Gurugram
     * -> SHOW, score 3
     *
     * Haryana + Delhi
     * -> SHOW, score 1
     *
     * Punjab + Gurugram
     * -> SHOW, score 2
     *
     * Punjab + Delhi
     * -> HIDE, score 0
     *
     * ============================================
     */

    const locationMatchedUsers =
      oppositeGenderUsers
        .map((user) => {
          const locationScore =
            getLocationScore(
              {
                state:
                  currentUser.state,
                city:
                  currentUser.city,
              },
              {
                state:
                  user.state,
                city:
                  user.city,
              },
            );

          return {
            user,
            locationScore,
          };
        })
        .filter(
          ({ locationScore }) =>
            locationScore > 0,
        );

    console.log(
      "DISCOVER LOCATION MATCHED:",
      locationMatchedUsers.length,
    );

    /*
     * ============================================
     * 11. Sort By Location Priority
     * ============================================
     *
     * 3 = State + City
     * 2 = City only
     * 1 = State only
     *
     * Within same location priority,
     * newest profiles first.
     * ============================================
     */

    locationMatchedUsers.sort(
      (a, b) => {
        if (
          b.locationScore !==
          a.locationScore
        ) {
          return (
            b.locationScore -
            a.locationScore
          );
        }

        const aDate =
          a.user.createdAt
            ? new Date(
                a.user.createdAt,
              ).getTime()
            : 0;

        const bDate =
          b.user.createdAt
            ? new Date(
                b.user.createdAt,
              ).getTime()
            : 0;

        return bDate - aDate;
      },
    );

    /*
     * ============================================
     * 12. Format Profiles
     * ============================================
     */

    const profiles =
      locationMatchedUsers.map(
        ({
          user,
          locationScore,
        }) => {
          const firstName =
            user.firstName || "";

          const lastName =
            user.lastName || "";

          const age =
            calculateAge(
              user.dateOfBirth,
            );

          const verified =
            Boolean(
              user.isEmailVerified,
            ) ||
            Boolean(
              user.isMobileVerified,
            );

          return {
            id:
              user._id.toString(),
              mobile: user.mobile || "",

            name:
              `${firstName} ${lastName}`.trim() ||
              "Unnamed profile",

            age,

            location: [
              user.city,
              user.state,
            ]
              .filter(Boolean)
              .join(", "),

            city:
              user.city || "",

            state:
              user.state || "",

            profession:
              user.profession ||
              "Profession not added",

            education:
              user.education ||
              "Education not added",

            maritalStatus:
              user.maritalStatus ||
              "Not specified",

            religion:
              user.religion || "",

            motherTongue:
              user.motherTongue || "",

            company:
              user.company || "",

            college:
              user.college || "",

            profileFor:
              user.profileFor || "",

            gender:
              user.gender || "",

            photo:
              getPhoto(
                user.photos,
              ),

            initials:
              getInitials(
                firstName,
                lastName,
              ),

            verified,

            isEmailVerified:
              Boolean(
                user.isEmailVerified,
              ),

            isMobileVerified:
              Boolean(
                user.isMobileVerified,
              ),

            profileComplete:
              Boolean(
                user.isProfileComplete,
              ),

            /*
             * Location relevance
             *
             * 3 = state + city
             * 2 = city
             * 1 = state
             */
            locationScore,

            createdAt:
              user.createdAt ||
              null,

            updatedAt:
              user.updatedAt ||
              null,
          };
        },
      );

    console.log(
      "DISCOVER FINAL PROFILES:",
      profiles.map(
        (profile) => ({
          name:
            profile.name,

          gender:
            profile.gender,

          state:
            profile.state,

          city:
            profile.city,

          locationScore:
            profile.locationScore,
        }),
      ),
    );

    /*
     * ============================================
     * 13. Response
     * ============================================
     */

    return NextResponse.json({
      success: true,

      currentUser: {
        id: currentUser._id.toString(),

        gender:
          currentGender,

        state:
          currentUser.state ||
          "",

        city:
          currentUser.city ||
          "",
      },

      users: profiles,
    });
  } catch (error) {
    console.error(
      "GET /api/users error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch discover profiles.",
        users: [],
      },
      {
        status: 500,
      },
    );
  }
}