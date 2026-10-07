import { NextRequest, NextResponse } from "next/server";

import PushSubscription from "@/models/PushSubscription";
import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
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

    const payload = await verifyAuthToken(token);

    if (!payload?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session",
        },
        {
          status: 401,
        },
      );
    }

    const subscription = await request.json();

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid push subscription",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    await PushSubscription.findOneAndUpdate(
      {
        endpoint: subscription.endpoint,
      },
      {
        userId: String(payload.userId),

        endpoint: subscription.endpoint,

        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription saved",
    });
  } catch (error) {
    console.error("PUSH_SUBSCRIBE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save push subscription",
      },
      {
        status: 500,
      },
    );
  }
}