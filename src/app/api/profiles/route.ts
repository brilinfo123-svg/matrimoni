import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

type ProfileUpdateBody = {
  name?: string;
  age?: string;
  location?: string;
  height?: string;
  maritalStatus?: string;
  motherTongue?: string;
  about?: string;

  education?: string;
  fieldOfStudy?: string;
  institute?: string;

  profession?: string;
  employment?: string;
  industry?: string;
  company?: string;

  familyType?: string;
  familyLocation?: string;
  siblings?: string;

  diet?: string;
  smoking?: string;
  drinking?: string;

  interests?: string[];

  preferredAgeMin?: string;
  preferredAgeMax?: string;
  preferredLocation?: string;
  preferredEducation?: string;
  preferredProfession?: string;
  preferredMaritalStatus?: string;
};

function cleanString(value: unknown, maxLength = 300) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function calculateAge(dateOfBirth: unknown) {
  if (!dateOfBirth) {
    return "";
  }

  const dob = new Date(String(dateOfBirth));

  if (Number.isNaN(dob.getTime())) {
    return "";
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "";
}

function getFullName(
  firstName: unknown,
  lastName: unknown,
) {
  return [
    cleanString(firstName, 100),
    cleanString(lastName, 100),
  ]
    .filter(Boolean)
    .join(" ");
}

function getLocation(
  city: unknown,
  state: unknown,
) {
  return [
    cleanString(city, 100),
    cleanString(state, 100),
  ]
    .filter(Boolean)
    .join(", ");
}

function getProfileImage(photos: unknown) {
  if (!Array.isArray(photos)) {
    return null;
  }

  const validPhoto = photos.find(
    (photo) =>
      typeof photo === "string" &&
      photo.trim().length > 0,
  );

  return validPhoto || null;
}

function calculateCompletion(user: any) {
  const checks = [
    Boolean(user.firstName),
    Boolean(user.lastName),
    Boolean(user.gender),
    Boolean(user.dateOfBirth),
    Boolean(user.state),
    Boolean(user.city),
    Boolean(user.religion),
    Boolean(user.motherTongue),
    Boolean(user.maritalStatus),

    Boolean(user.height),
    Boolean(user.about),

    Boolean(user.education),
    Boolean(user.fieldOfStudy),
    Boolean(user.college),

    Boolean(user.profession),
    Boolean(user.employment),
    Boolean(user.industry),

    Boolean(user.familyType),
    Boolean(user.familyLocation),
    Boolean(user.siblings),

    Boolean(user.diet),
    Boolean(user.smoking),
    Boolean(user.drinking),

    Array.isArray(user.interests) &&
      user.interests.length > 0,

    Boolean(user.partnerAgeMin),
    Boolean(user.partnerAgeMax),
    Boolean(user.partnerState),
    Boolean(user.partnerCity),
    Boolean(user.partnerEducation),
    Boolean(user.partnerProfession),
    Boolean(user.partnerMaritalStatus),

    Array.isArray(user.photos) &&
      user.photos.length > 0,
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round(
    (completed / checks.length) * 100,
  );
}

function buildProfile(user: any) {
  const partnerState =
    cleanString(user.partnerState, 100);

  const partnerCity =
    cleanString(user.partnerCity, 100);

  const preferredLocation = [
    partnerCity,
    partnerState,
  ]
    .filter(Boolean)
    .join(", ");

  const completion =
    calculateCompletion(user);

  return {
    id: user._id?.toString(),

    name: getFullName(
      user.firstName,
      user.lastName,
    ),

    age: calculateAge(
      user.dateOfBirth,
    ),

    location: getLocation(
      user.city,
      user.state,
    ),

    height: cleanString(
      user.height,
      30,
    ),

    maritalStatus: cleanString(
      user.maritalStatus,
      100,
    ),

    motherTongue: cleanString(
      user.motherTongue,
      100,
    ),

    about: cleanString(
      user.about,
      500,
    ),

    education: cleanString(
      user.education,
      150,
    ),

    fieldOfStudy: cleanString(
      user.fieldOfStudy,
      150,
    ),

    institute: cleanString(
      user.college,
      200,
    ),

    profession: cleanString(
      user.profession,
      150,
    ),

    employment: cleanString(
      user.employment,
      100,
    ),

    industry: cleanString(
      user.industry,
      150,
    ),

    company: cleanString(
      user.company,
      200,
    ),

    familyType: cleanString(
      user.familyType,
      100,
    ),

    familyLocation: cleanString(
      user.familyLocation,
      150,
    ),

    siblings: cleanString(
      user.siblings,
      100,
    ),

    diet: cleanString(
      user.diet,
      100,
    ),

    smoking: cleanString(
      user.smoking,
      100,
    ),

    drinking: cleanString(
      user.drinking,
      100,
    ),

    interests:
      Array.isArray(user.interests)
        ? user.interests
        : [],

    preferredAgeMin:
      user.partnerAgeMin != null
        ? String(user.partnerAgeMin)
        : "",

    preferredAgeMax:
      user.partnerAgeMax != null
        ? String(user.partnerAgeMax)
        : "",

    preferredLocation,

    preferredEducation:
      cleanString(
        user.partnerEducation,
        150,
      ),

    preferredProfession:
      cleanString(
        user.partnerProfession,
        150,
      ),

    preferredMaritalStatus:
      cleanString(
        user.partnerMaritalStatus,
        100,
      ),

    profileImage:
      getProfileImage(user.photos),

    photos:
      Array.isArray(user.photos)
        ? user.photos
        : [],

    isEmailVerified:
      Boolean(user.isEmailVerified),

    isMobileVerified:
      Boolean(user.isMobileVerified),

    isProfileComplete:
      Boolean(user.isProfileComplete),

    completion,
  };
}

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      AUTH_COOKIE_NAME,
    )?.value;

  if (!token) {
    return null;
  }

  const session =
    await verifyAuthToken(token);

  return session?.userId ?? null;
}

function parseLocation(
  location: string,
  currentCity: string,
  currentState: string,
) {
  if (!location) {
    return {
      city: currentCity,
      state: currentState,
    };
  }

  const parts = location
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts.slice(1).join(", "),
    };
  }

  return {
    city: parts[0],
    state: currentState,
  };
}

export async function GET() {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user session.",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error(
        "Database connection is not available.",
      );
    }

    const user =
      await db
        .collection("users")
        .findOne(
          {
            _id:
              new mongoose.Types.ObjectId(
                userId,
              ),
          },
          {
            projection: {
              password: 0,
              email: 0,
              mobile: 0,
            },
          },
        );

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
    console.error(
      "GET /api/profile error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load profile.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user session.",
        },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as ProfileUpdateBody;

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error(
        "Database connection is not available.",
      );
    }

    const users =
      db.collection("users");

    const currentUser =
      await users.findOne({
        _id:
          new mongoose.Types.ObjectId(
            userId,
          ),
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

    /*
     * ------------------------------------------
     * NAME
     * ------------------------------------------
     */

    const fullName =
      cleanString(
        body.name,
        150,
      );

    const nameParts =
      fullName
        .split(/\s+/)
        .filter(Boolean);

    const firstName =
      nameParts.shift() ||
      cleanString(
        currentUser.firstName,
        100,
      );

    const lastName =
      nameParts.join(" ") ||
      cleanString(
        currentUser.lastName,
        100,
      );

    /*
     * ------------------------------------------
     * LOCATION
     * ------------------------------------------
     */

    const currentCity =
      cleanString(
        currentUser.city,
        100,
      );

    const currentState =
      cleanString(
        currentUser.state,
        100,
      );

    const location =
      cleanString(
        body.location,
        150,
      );

    const parsedLocation =
      parseLocation(
        location,
        currentCity,
        currentState,
      );

    /*
     * ------------------------------------------
     * PARTNER LOCATION
     * ------------------------------------------
     *
     * Existing UI uses:
     *
     * "Gurugram, Haryana"
     *
     * We convert that to:
     *
     * partnerCity = Gurugram
     * partnerState = Haryana
     *
     * ------------------------------------------
     */

    const existingPartnerCity =
      cleanString(
        currentUser.partnerCity,
        100,
      );

    const existingPartnerState =
      cleanString(
        currentUser.partnerState,
        100,
      );

    const preferredLocation =
      cleanString(
        body.preferredLocation,
        150,
      );

    let partnerCity =
      existingPartnerCity;

    let partnerState =
      existingPartnerState;

    if (preferredLocation) {
      const preferredParts =
        preferredLocation
          .split(",")
          .map(
            (item) => item.trim(),
          )
          .filter(Boolean);

      if (
        preferredParts.length >= 2
      ) {
        partnerCity =
          preferredParts[0];

        partnerState =
          preferredParts
            .slice(1)
            .join(", ");
      } else {
        /*
         * If only one value is entered,
         * preserve the existing city and
         * update the state.
         */
        partnerState =
          preferredParts[0];
      }
    }

    /*
     * ------------------------------------------
     * INTERESTS
     * ------------------------------------------
     */

    const interests =
      normalizeArray(
        body.interests,
      );

    /*
     * ------------------------------------------
     * UPDATE
     * ------------------------------------------
     */

    const updateData = {
      firstName,
      lastName,

      city: parsedLocation.city,
      state: parsedLocation.state,

      height: cleanString(
        body.height,
        30,
      ),

      maritalStatus:
        cleanString(
          body.maritalStatus,
          100,
        ),

      motherTongue:
        cleanString(
          body.motherTongue,
          100,
        ),

      about: cleanString(
        body.about,
        500,
      ),

      education:
        cleanString(
          body.education,
          150,
        ),

      fieldOfStudy:
        cleanString(
          body.fieldOfStudy,
          150,
        ),

      college:
        cleanString(
          body.institute,
          200,
        ),

      profession:
        cleanString(
          body.profession,
          150,
        ),

      employment:
        cleanString(
          body.employment,
          100,
        ),

      industry:
        cleanString(
          body.industry,
          150,
        ),

      company:
        cleanString(
          body.company,
          200,
        ),

      familyType:
        cleanString(
          body.familyType,
          100,
        ),

      familyLocation:
        cleanString(
          body.familyLocation,
          150,
        ),

      siblings:
        cleanString(
          body.siblings,
          100,
        ),

      diet:
        cleanString(
          body.diet,
          100,
        ),

      smoking:
        cleanString(
          body.smoking,
          100,
        ),

      drinking:
        cleanString(
          body.drinking,
          100,
        ),

      interests,

      partnerAgeMin:
        cleanString(
          body.preferredAgeMin,
          10,
        ),

      partnerAgeMax:
        cleanString(
          body.preferredAgeMax,
          10,
        ),

      partnerState,

      partnerCity,

      partnerEducation:
        cleanString(
          body.preferredEducation,
          150,
        ),

      partnerProfession:
        cleanString(
          body.preferredProfession,
          150,
        ),

      partnerMaritalStatus:
        cleanString(
          body.preferredMaritalStatus,
          100,
        ),

      updatedAt: new Date(),
    };

    /*
     * ------------------------------------------
     * PROFILE COMPLETION
     * ------------------------------------------
     */

    const updatedUser = {
      ...currentUser,
      ...updateData,
    };

    const completion =
      calculateCompletion(
        updatedUser,
      );

    updateData[
      "isProfileComplete" as keyof typeof updateData
    ] = completion >= 80 as never;

    /*
     * ------------------------------------------
     * SAVE TO MONGODB
     * ------------------------------------------
     */

    await users.updateOne(
      {
        _id:
          new mongoose.Types.ObjectId(
            userId,
          ),
      },
      {
        $set: updateData,
      },
    );

    const savedUser =
      await users.findOne(
        {
          _id:
            new mongoose.Types.ObjectId(
              userId,
            ),
        },
        {
          projection: {
            password: 0,
            email: 0,
            mobile: 0,
          },
        },
      );

    if (!savedUser) {
      throw new Error(
        "Unable to load updated profile.",
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Profile updated successfully.",
      profile:
        buildProfile(savedUser),
    });
  } catch (error) {
    console.error(
      "PATCH /api/profile error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update profile.",
      },
      { status: 500 },
    );
  }
}