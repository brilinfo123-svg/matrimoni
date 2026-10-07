import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

/* -------------------------------------------------------
   AGE CALCULATOR
------------------------------------------------------- */
function calculateAge(dateOfBirth: string | Date) {
  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
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

  if (age < 0) {
    return null;
  }

  return age;
}

/* -------------------------------------------------------
   GET FEATURED PROFILES
------------------------------------------------------- */
export async function GET() {
  try {
    await connectDB();

    const users = await User.find({
      dateOfBirth: {
        $exists: true,
        $ne: null,
      },
    })
      .select(
        "_id firstName lastName dateOfBirth city state profession education photos profilePhoto isEmailVerified isMobileVerified mobile"
      )
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    /* ---------------------------------------------------
       DEBUG
    --------------------------------------------------- */

    console.log(
      "FEATURED USERS:",
      users.map((user: any) => ({
        id: user._id.toString(),
        name: `${user.firstName || ""} ${
          user.lastName || ""
        }`.trim(),
        mobile: user.mobile,
        mobileType: typeof user.mobile,
      }))
    );

    /* ---------------------------------------------------
       FORMAT PROFILES
    --------------------------------------------------- */

    const profiles = users.map((user: any) => {
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";

      const name =
        `${firstName} ${lastName}`.trim() ||
        "Member";

      const initials =
        `${firstName.charAt(0)}${lastName.charAt(
          0
        )}`.toUpperCase() || "US";

      const location = [
        user.city,
        user.state,
      ]
        .filter(Boolean)
        .join(", ");

      /* -----------------------------------------------
         PROFILE IMAGE
      ------------------------------------------------ */

      let image = "";

      if (
        Array.isArray(user.photos) &&
        user.photos.length > 0
      ) {
        image = user.photos[0];
      } else if (user.profilePhoto) {
        image = user.profilePhoto;
      }

      /* -----------------------------------------------
         VERIFIED STATUS
      ------------------------------------------------ */

      const verified =
        Boolean(user.isEmailVerified) ||
        Boolean(user.isMobileVerified);

      /* -----------------------------------------------
         MOBILE
      ------------------------------------------------ */

      const mobile =
        user.mobile &&
        String(user.mobile).trim()
          ? String(user.mobile).trim()
          : null;

      return {
        id: user._id.toString(),
        name,
        age: calculateAge(user.dateOfBirth),
        location:
          location || "Location not specified",
        profession:
          user.profession ||
          "Profession not specified",
        education:
          user.education ||
          "Education not specified",
        image,
        initials,
        verified,
        mobile,
      };
    });

    console.log(
      "FEATURED PROFILES RESPONSE:",
      profiles
    );

    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error(
      "FEATURED_PROFILES_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load profiles.",
        profiles: [],
      },
      {
        status: 500,
      }
    );
  }
}
