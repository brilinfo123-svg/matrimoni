import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session/session";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      conversationId: string;
    }>;
  },
) {
  try {
    await connectDB();

    /* =====================================================
       CURRENT USER
    ===================================================== */

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

    /* =====================================================
       CONVERSATION ID
    ===================================================== */

    const { conversationId } =
      await context.params;

    if (
      !mongoose.isValidObjectId(
        conversationId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid conversation ID",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND CONVERSATION
    ===================================================== */

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        participants:
          currentUser._id,
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

    /* =====================================================
       MAKE SURE deletedFor IS AN ARRAY

       Older conversations may not have this field.
    ===================================================== */

    const deletedFor =
      Array.isArray(
        conversation.deletedFor,
      )
        ? conversation.deletedFor
        : [];

    /* =====================================================
       FIND OTHER USER
    ===================================================== */

    const otherParticipant =
      conversation.participants.find(
        (participant) =>
          String(participant) !==
          String(currentUser._id),
      );

    if (!otherParticipant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Other participant not found",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       CHECK CURRENT USER ALREADY DELETED
    ===================================================== */

    const currentUserAlreadyDeleted =
      deletedFor.some(
        (deletedUser) =>
          String(deletedUser) ===
          String(currentUser._id),
      );

    if (currentUserAlreadyDeleted) {
      return NextResponse.json({
        success: true,
        permanentlyDeleted: false,
        alreadyDeleted: true,
        message:
          "Conversation is already deleted for current user",
      });
    }

    /* =====================================================
       CHECK OTHER USER DELETED
    ===================================================== */

    const otherUserAlreadyDeleted =
      deletedFor.some(
        (deletedUser) =>
          String(deletedUser) ===
          String(otherParticipant),
      );

    /* =====================================================
       BOTH USERS DELETED
       → PERMANENT DELETE
    ===================================================== */

    if (otherUserAlreadyDeleted) {
      /* ---------------------------------------------
         DELETE ALL MESSAGES
      --------------------------------------------- */

      const messageDeleteResult =
        await Message.deleteMany({
          conversationId:
            conversation._id,
        });

      /* ---------------------------------------------
         DELETE CONVERSATION
      --------------------------------------------- */

      await Conversation.deleteOne({
        _id: conversation._id,
      });

      console.log(
        "Conversation permanently deleted:",
        {
          conversationId:
            String(
              conversation._id,
            ),

          currentUser:
            String(
              currentUser._id,
            ),

          otherParticipant:
            String(
              otherParticipant,
            ),

          deletedMessages:
            messageDeleteResult.deletedCount,
        },
      );

      return NextResponse.json({
        success: true,

        permanentlyDeleted: true,

        alreadyDeleted: false,

        message:
          "Conversation and all messages permanently deleted",
      });
    }

    /* =====================================================
       ONLY CURRENT USER DELETES
       → SOFT DELETE
    ===================================================== */

    const updateResult =
      await Conversation.updateOne(
        {
          _id: conversation._id,

          participants:
            currentUser._id,
        },
        {
          $addToSet: {
            deletedFor:
              currentUser._id,
          },
        },
      );

    console.log(
      "Conversation soft delete update:",
      {
        conversationId:
          String(
            conversation._id,
          ),

        currentUser:
          String(
            currentUser._id,
          ),

        matched:
          updateResult.matchedCount,

        modified:
          updateResult.modifiedCount,
      },
    );

    /* =====================================================
       VERIFY DATABASE UPDATE
    ===================================================== */

    const updatedConversation =
      await Conversation.findById(
        conversation._id,
      ).select(
        "_id participants deletedFor",
      );

    console.log(
      "Conversation delete result:",
      {
        conversationId:
          String(
            conversation._id,
          ),

        currentUser:
          String(
            currentUser._id,
          ),

        deletedFor:
          Array.isArray(
            updatedConversation?.deletedFor,
          )
            ? updatedConversation.deletedFor.map(
                (id) =>
                  String(id),
              )
            : [],
      },
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      permanentlyDeleted: false,

      alreadyDeleted: false,

      message:
        "Conversation deleted for current user",
    });
  } catch (error) {
    console.error(
      "Delete conversation API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete conversation",
      },
      {
        status: 500,
      },
    );
  }
}