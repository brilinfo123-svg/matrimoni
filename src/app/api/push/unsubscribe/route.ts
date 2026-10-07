import { NextRequest, NextResponse } from "next/server";

import PushSubscription from "@/models/PushSubscription";
import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();

    if (!body?.endpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Endpoint is required",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    await PushSubscription.deleteOne({
      userId: String(payload.userId),
      endpoint: body.endpoint,
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription removed",
    });
  } catch (error) {
    console.error("PUSH_UNSUBSCRIBE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove push subscription",
      },
      {
        status: 500,
      },
    );
  }
}