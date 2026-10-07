import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session/session";

import Conversation from "@/models/Conversation";
import User from "@/models/User";
import Message from "@/models/Message";

/* =======================================================
   CREATE CONVERSATION KEY
======================================================= */

function createConversationKey(
  userA: string,
  userB: string,
) {
  return [
    String(userA),
    String(userB),
  ]
    .sort()
    .join("_");
}

/* =======================================================
   FORMAT CONVERSATION TIME
======================================================= */

function formatConversationTime(
  date?: Date | string | null,
) {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const now = new Date();

  if (
    value.toDateString() ===
    now.toDateString()
  ) {
    return value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);

  yesterday.setDate(
    yesterday.getDate() - 1,
  );

  if (
    value.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return value.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

/* =======================================================
   MAP CONVERSATION
======================================================= */

async function mapConversation(
  conversation: any,
  currentUserId: string,
) {
  if (!conversation) {
    return null;
  }

  const participants =
    conversation.participants || [];

  const otherUser =
    participants.find(
      (participant: any) =>
        String(participant?._id) !==
        String(currentUserId),
    );

  if (!otherUser) {
    return null;
  }

  const unread =
    await Message.countDocuments({
      conversationId:
        conversation._id,

      receiverId:
        currentUserId,

      read: false,
    });

  const firstName =
    otherUser.firstName || "";

  const lastName =
    otherUser.lastName || "";

  const name =
    `${firstName} ${lastName}`
      .trim() || "User";

  const location =
    [
      otherUser.city,
      otherUser.state,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Location unavailable";

  return {
    id: String(
      conversation._id,
    ),

    participantId: String(
      otherUser._id,
    ),

    name,

    initials:
      name
        .split(/\s+/)
        .map(
          (part: string) =>
            part.charAt(0),
        )
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U",

    location,

    profession:
      otherUser.profession ||
      "Professional",

    compatibility:
      Number(
        otherUser.compatibility,
      ) || 0,

    verified:
      Boolean(
        otherUser.isVerified ||
          otherUser.isEmailVerified ||
          otherUser.isMobileVerified,
      ),

    online: false,

    phone:
      otherUser.mobile ||
      otherUser.phone ||
      undefined,

    unread,

    lastMessage:
      conversation.lastMessage ||
      "Start a conversation",

    lastTime:
      formatConversationTime(
        conversation.lastMessageAt,
      ),

    messages: [],
  };
}

/* =======================================================
   GET CONVERSATIONS
======================================================= */

export async function GET() {
  try {
    await connectDB();

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * IMPORTANT:
     *
     * Only return conversations where
     * current user has NOT deleted it.
     *
     * If:
     *
     * deletedFor = [A]
     *
     * A will not receive the conversation.
     *
     * B will still receive it.
     */
    const conversations =
      await Conversation.find({
        participants:
          currentUser._id,

        deletedFor: {
          $ne: currentUser._id,
        },
      })
        .populate({
          path: "participants",

          select:
            "firstName lastName photos city state profession mobile phone isVerified isEmailVerified isMobileVerified compatibility",
        })
        .sort({
          lastMessageAt: -1,
        })
        .lean();

    const mapped =
      await Promise.all(
        conversations.map(
          (conversation) =>
            mapConversation(
              conversation,
              String(
                currentUser._id,
              ),
            ),
        ),
      );

    const valid =
      mapped.filter(Boolean);

    const unique =
      new Map<
        string,
        NonNullable<
          (typeof valid)[number]
        >
      >();

    for (const conversation of valid) {
      if (
        !conversation ||
        !conversation.participantId
      ) {
        continue;
      }

      if (
        !unique.has(
          String(
            conversation.participantId,
          ),
        )
      ) {
        unique.set(
          String(
            conversation.participantId,
          ),
          conversation,
        );
      }
    }

    return NextResponse.json({
      success: true,

      conversations:
        Array.from(
          unique.values(),
        ),
    });
  } catch (error) {
    console.error(
      "Conversations GET API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load conversations",
      },
      {
        status: 500,
      },
    );
  }
}

/* =======================================================
   POST CREATE / GET EXISTING CONVERSATION
======================================================= */

export async function POST(
  request: NextRequest,
) {
  try {
    await connectDB();

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const targetUserId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    if (!targetUserId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "userId is required",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !mongoose.isValidObjectId(
        targetUserId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid userId",
        },
        {
          status: 400,
        },
      );
    }

    if (
      String(targetUserId) ===
      String(currentUser._id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot create a conversation with yourself",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND TARGET USER
    ===================================================== */

    const targetUser =
      await User.findById(
        targetUserId,
      ).select(
        "_id firstName lastName photos city state profession mobile phone isActive isVerified isEmailVerified isMobileVerified compatibility",
      );

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    if (
      targetUser.isActive === false
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This profile is not available",
        },
        {
          status: 403,
        },
      );
    }

    /* =====================================================
       CONVERSATION KEY
    ===================================================== */

    const conversationKey =
      createConversationKey(
        String(
          currentUser._id,
        ),
        String(
          targetUser._id,
        ),
      );

    /* =====================================================
       FIND EXISTING CONVERSATION
    ===================================================== */

    let conversation =
      await Conversation.findOne({
        conversationKey,
      });

    /* =====================================================
       OLD CONVERSATION SUPPORT
    ===================================================== */

    if (!conversation) {
      conversation =
        await Conversation.findOne({
          participants: {
            $all: [
              currentUser._id,
              targetUser._id,
            ],

            $size: 2,
          },
        });

      if (conversation) {
        conversation.conversationKey =
          conversationKey;

        /*
         * Make sure old conversation
         * has deletedFor.
         */
        if (!Array.isArray(conversation.deletedFor)) {
            conversation.deletedFor = [];
            await conversation.save();
          } {
          conversation.deletedFor = [];
        }

        await conversation.save();
      }
    }

    let created = false;

    /* =====================================================
       CREATE NEW CONVERSATION
    ===================================================== */

    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            currentUser._id,
            targetUser._id,
          ],

          conversationKey,

          lastMessage: "",

          lastMessageAt:
            new Date(),

          deletedFor: [],
        });

      created = true;
    }

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create conversation",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * IMPORTANT:
     *
     * DO NOT automatically remove current
     * user from deletedFor here.
     *
     * Otherwise refreshing:
     *
     * /messages?userId=B
     *
     * would restore A's deleted chat.
     *
     * A new message will restore the chat
     * through the message API/socket.
     */

    /* =====================================================
       POPULATE
    ===================================================== */

    const populatedConversation =
      await Conversation.findById(
        conversation._id,
      )
        .populate({
          path: "participants",

          select:
            "firstName lastName photos city state profession mobile phone isVerified isEmailVerified isMobileVerified compatibility",
        })
        .lean();

    if (!populatedConversation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Conversation not found",
        },
        {
          status: 404,
        },
      );
    }

    const mapped =
      await mapConversation(
        populatedConversation,
        String(
          currentUser._id,
        ),
      );

    if (!mapped) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to map conversation",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        created,

        conversation:
          mapped,
      },
      {
        status: created
          ? 201
          : 200,
      },
    );
  } catch (error) {
    console.error(
      "Conversations POST API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create conversation",
      },
      {
        status: 500,
      },
    );
  }
}