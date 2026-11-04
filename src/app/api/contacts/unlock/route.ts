import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getContactUserId } from "@/lib/contact-auth";
import User from "@/models/User";

const FREE_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login." },
        { status: 401 }
      );
    }

    const { profileId } = await request.json();

    if (
      typeof profileId !== "string" ||
      !mongoose.Types.ObjectId.isValid(profileId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid profile ID." },
        { status: 400 }
      );
    }

    if (profileId === userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot unlock your own profile.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const targetObjectId = new mongoose.Types.ObjectId(profileId);

    const target = await User.findOne({
      _id: targetObjectId,
      isActive: true,
      isMobileVisible: true,
    }).select(
      "firstName lastName mobile city state isMobileVisible"
    );

    if (!target || !target.mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact details are not available.",
        },
        { status: 404 }
      );
    }

    const now = new Date();

    // Atomically unlock profile and deduct the correct credit.
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,

        unlockedProfiles: {
          $ne: targetObjectId,
        },

        $or: [
          { premiumUntil: { $gt: now } },
          { freeContactUnlocksUsed: { $lt: FREE_LIMIT } },
          { freeContactUnlocksUsed: { $exists: false } },
          { contactCredits: { $gt: 0 } },
        ],
      },
      [
        {
          $set: {
            unlockedProfiles: {
              $concatArrays: [
                {
                  $ifNull: ["$unlockedProfiles", []],
                },
                [targetObjectId],
              ],
            },

            freeContactUnlocksUsed: {
              $let: {
                vars: {
                  used: {
                    $ifNull: [
                      "$freeContactUnlocksUsed",
                      0,
                    ],
                  },

                  premium: {
                    $gt: [
                      {
                        $ifNull: [
                          "$premiumUntil",
                          new Date(0),
                        ],
                      },
                      now,
                    ],
                  },
                },

                in: {
                  $cond: [
                    "$$premium",
                    "$$used",
                    {
                      $cond: [
                        {
                          $lt: [
                            "$$used",
                            FREE_LIMIT,
                          ],
                        },
                        {
                          $add: ["$$used", 1],
                        },
                        "$$used",
                      ],
                    },
                  ],
                },
              },
            },

            contactCredits: {
              $let: {
                vars: {
                  used: {
                    $ifNull: [
                      "$freeContactUnlocksUsed",
                      0,
                    ],
                  },

                  premium: {
                    $gt: [
                      {
                        $ifNull: [
                          "$premiumUntil",
                          new Date(0),
                        ],
                      },
                      now,
                    ],
                  },

                  credits: {
                    $ifNull: [
                      "$contactCredits",
                      0,
                    ],
                  },
                },

                in: {
                  $cond: [
                    "$$premium",
                    "$$credits",
                    {
                      $cond: [
                        {
                          $lt: [
                            "$$used",
                            FREE_LIMIT,
                          ],
                        },
                        "$$credits",
                        {
                          $subtract: [
                            "$$credits",
                            1,
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      ],
      {
        new: true,
        updatePipeline: true,
      }
    );

    let finalUser = updatedUser;
    let alreadyUnlocked = false;

    if (!updatedUser) {
      // Check whether profile was already unlocked.
      const existingUser = await User.findById(userId).select(
        "unlockedProfiles contactCredits freeContactUnlocksUsed premiumUntil"
      );

      alreadyUnlocked =
        existingUser?.unlockedProfiles?.some(
          (id) => id.toString() === profileId
        ) ?? false;

      if (!alreadyUnlocked || !existingUser) {
        return NextResponse.json(
          {
            success: false,
            code: "NO_CONTACT_CREDITS",
            message:
              "No contact credits remaining. Please upgrade.",
          },
          { status: 402 }
        );
      }

      finalUser = existingUser;
    }

    // Return mobile only after successful authorization.
    return NextResponse.json({
      success: true,
      alreadyUnlocked,

      profile: {
        id: target._id.toString(),

        name: `${target.firstName || ""} ${
          target.lastName || ""
        }`.trim(),

        mobile: String(target.mobile),
        city: target.city || "",
        state: target.state || "",
      },

      balance: {
        freeContactUnlocksUsed:
          finalUser?.freeContactUnlocksUsed ?? 0,

        contactCredits:
          finalUser?.contactCredits ?? 0,

        premiumUntil:
          finalUser?.premiumUntil ?? null,
      },
    });
  } catch (error) {
    console.error("CONTACT_UNLOCK_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to unlock contact.",
      },
      { status: 500 }
    );
  }
}