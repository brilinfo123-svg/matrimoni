import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session/session";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

/**
 * GET
 * Load all messages of a conversation.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    const user =
      await getCurrentUser();

    if (!user) {
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

    const { conversationId } =
      await context.params;

    /*
     * Make sure current user belongs
     * to this conversation AND has
     * not deleted it.
     */
    const conversation =
      await Conversation.findOne({
        _id: conversationId,

        participants:
          user._id,

        deletedFor: {
          $ne: user._id,
        },
      }).lean();

    if (!conversation) {
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

    /*
     * Get messages.
     */
    const messages =
      await Message.find({
        conversationId,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    /*
     * Mark received unread messages
     * as read.
     */
    await Message.updateMany(
      {
        conversationId,

        receiverId:
          user._id,

        read: false,
      },
      {
        $set: {
          read: true,
        },
      },
    );

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(
      "Messages GET API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load messages",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST
 * Create a new message.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    const user =
      await getCurrentUser();

    if (!user) {
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

    const { conversationId } =
      await context.params;

    /*
     * User must belong to conversation.
     *
     * We intentionally do NOT filter
     * deletedFor here.
     *
     * Why?
     *
     * If B sends a new message to A
     * after A deleted the conversation,
     * this message should restore A's chat.
     */
    const conversation =
      await Conversation.findOne({
        _id: conversationId,

        participants:
          user._id,
      });

    if (!conversation) {
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

    const body =
      await request.json();

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message text is required",
        },
        {
          status: 400,
        },
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot exceed 2000 characters",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND RECEIVER
    ===================================================== */

    const receiverId =
      conversation.participants.find(
        (participantId) =>
          participantId.toString() !==
          user._id.toString(),
      );

    if (!receiverId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Receiver not found",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       SAVE MESSAGE
    ===================================================== */

    const message =
      await Message.create({
        conversationId:
          conversation._id,

        senderId:
          user._id,

        receiverId,

        text,

        read: false,
      });

    /* =====================================================
       RESTORE CHAT FOR BOTH SIDES
    ===================================================== */

    /*
     * If receiver had deleted the
     * conversation:
     *
     * deletedFor = [A]
     *
     * B sends message
     *
     * deletedFor = []
     *
     * A sees the chat again.
     *
     * Also remove sender from deletedFor
     * if sender had deleted it earlier.
     */
    await Conversation.updateOne(
      {
        _id:
          conversation._id,
      },
      {
        $pull: {
          deletedFor: {
            $in: [
              user._id,
              receiverId,
            ],
          },
        },

        $set: {
          lastMessage:
            text,

          lastMessageAt:
            message.createdAt,
        },
      },
    );

    return NextResponse.json(
      {
        success: true,

        message,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Messages POST API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send message",
      },
      {
        status: 500,
      },
    );
  }
}